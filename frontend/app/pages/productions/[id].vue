<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import type { ProductionView, TagView, SeriesView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useGallery } from "~/composables/media/useGallery";
import { useSeriesApi } from "~/composables/useSeriesApi";

/** validation that id is only numbers */
definePageMeta({
  validate: async (route) => {
    const raw = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id;
    return /^\d+$/.test(raw as string);
  },
});

const { t, locale } = useI18n();
const router = useRouter();
const { getById, getTags, getBlogs, getMediaGallery } = useProductionApi();
const { getAll: getAllSeries } = useSeriesApi();
const { getMainImageCrop, getCarouselImageCrops } = useGallery();
const route = useRoute();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.productions.base);
  }
};

const productionId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

/** Get the main production data */
const {
  data: production,
  status,
  error,
} = useAsyncData<ProductionView>(
  `prod-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null;
    const res = await getById(productionId.value, locale.value as any);
    return (res as any)?.data;
  },
  { watch: [productionId, locale] },
);

// Watch the production fetch to see if everything is fetched correctly.
watch(
  [status, error, production],
  ([newStatus, newError, newProd]) => {
    if (newStatus === "success" && !newProd) {
      showError({
        statusCode: 404,
        statusMessage: "Production not found",
        fatal: true,
      });
    } else if (newError) {
      showError({ statusCode: 500, statusMessage: "API Error", fatal: true });
    }
  },
  { immediate: true },
);

/** get series */
const { data: linkedSeries } = useAsyncData<SeriesView[]>(
  `prod-series-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return [];
    try {
      const resp = await getAllSeries({
        seriesFilters: { production_id: productionId.value } as any,
        languageFilters: { lang: locale.value },
      });
      return (resp.data as any)?.objects ?? resp.data ?? [];
    } catch (err) {
      console.error("Error loading linked series on detail page:", err);
      return [];
    }
  },
  { watch: [productionId, locale], default: () => [] },
);

/** Get tags and remove empty ones */
const { data: tags } = useAsyncData<TagView[]>(
  `prod-tags-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return [];
    const res = await getTags(productionId.value, locale.value as any);
    const data = (res as any)?.data ?? res;
    if (!Array.isArray(data)) return [];
    return data.filter((t) => (t.tag || "").trim().length > 1);
  },
  { watch: [productionId, locale] },
);

const { getAll: getAllEvents, getLocation, getPrices } = useEventApi();

/** Get all events with their location and prices */
const { data: events } = useAsyncData(
  `events-detailed-${route.params.id}`,
  async () => {
    if (!productionId.value) return [];

    const res = await getAllEvents({
      eventFilters: { production_id: productionId.value },
    });
    const list = res.data?.objects ?? [];

    if (!list.length) return [];

    return Promise.all(
      list.map(async (e) => {
        const [locRes, priceRes] = await Promise.all([
          getLocation(e.id, locale.value as any).catch(() => null),
          getPrices(e.id, locale.value as any).catch(() => []),
        ]);

        const locationData = (locRes as any)?.data ?? locRes;
        const pricesData = (priceRes as any)?.data ?? priceRes ?? [];

        return {
          ...e,
          location: locationData,
          prices: Array.isArray(pricesData) ? pricesData : [],
        };
      }),
    );
  },
  {
    watch: [productionId, locale],
    default: () => [],
  },
);

/** Get blogs/stories */
const { data: stories } = useAsyncData(
  `prod-stories-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return [];
    const res = await getBlogs(productionId.value, locale.value as any);

    const data = (res as any)?.data ?? res;
    return Array.isArray(data) ? data : [];
  },
  { watch: [productionId, locale], default: () => [] },
);

/** Gets the production gallery. Handles API nesting and page-specific data fetching.*/
const { data: gallery } = useAsyncData<GalleryWithItems<ItemViewWithCrops>>(
  `gallery-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null;
    const res = await getMediaGallery(productionId.value, locale.value);
    return (res as any)?.data ?? res;
  },
  { watch: [productionId, locale] },
);

const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

// carousel
const carouselImages = computed(() => {
  if (!gallery.value || !gallery.value.items) return [];
  return getCarouselImageCrops(gallery.value, "hd_ready");
});

/**
 * Check if a string is useful (not "N/A" or empty)
 */
const isValid = (val: any) => {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s !== "" && s !== "N/A" && s !== "UNDEFINED";
};

const showAllSeries = ref(false);
const maxVisibleSeries = 2;

const visibleSeries = computed(() => {
  return linkedSeries.value?.slice(0, maxVisibleSeries) || [];
});

const hiddenSeries = computed(() => {
  return linkedSeries.value?.slice(maxVisibleSeries) || [];
});
</script>

<template>
  <ProductionSkeleton v-if="status === 'pending'" />

  <main
    v-else-if="production"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <DetailHero
      :id="production.id"
      :title="production.titel"
      :subtitle="
        isValid(production.artist) && production.artist !== production.titel
          ? production.artist
          : null
      "
      :header-crop="headerCrop"
      :back-text="t('general.back')"
      @back="goBack"
    >
      <template #meta>
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-if="isValid(production.performer_type)"
            :class="
              headerCrop
                ? 'border-white text-white bg-white/5'
                : 'border-foreground text-foreground dark:text-gray-100 bg-foreground/5'
            "
            class="border border-[1.5px] px-2 py-1 text-[10px] font-black uppercase rounded-sm backdrop-blur-sm"
          >
            {{ production.performer_type }}
          </span>

          <template v-if="visibleSeries.length">
            <SeriesLabel
              v-for="serie in visibleSeries"
              :key="serie.id"
              :serie="serie"
            />
          </template>

          <template v-if="showAllSeries && hiddenSeries.length">
            <SeriesLabel
              v-for="serie in hiddenSeries"
              :key="serie.id"
              :serie="serie"
              class="animate-in fade-in zoom-in-95 duration-150"
            />
          </template>

          <button
            v-if="hiddenSeries.length"
            type="button"
            @click="showAllSeries = !showAllSeries"
            class="flex items-center gap-1 bg-background/80 backdrop-blur-md text-foreground border border-border/40 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-background/90 hover:text-accent"
          >
            <span v-if="!showAllSeries">+{{ hiddenSeries.length }}</span>
            <span v-else class="transition-colors hover:text-accent"
              >&times; minder</span
            >
          </button>
        </div>
      </template>

      <template #footer>
        <div
          v-if="tags?.some((t) => isValid(t.tag))"
          class="flex flex-wrap gap-3 mt-8"
        >
          <template v-for="tag in tags" :key="tag.id">
            <span
              v-if="isValid(tag.tag)"
              class="bg-accent text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px] shadow-sm"
            >
              {{ tag.tag }}
            </span>
          </template>
        </div>
      </template>
    </DetailHero>

    <section class="py-20">
      <div class="page-container">
        <div class="w-full">
          <div v-if="isValid(production.tagline)" class="mb-10">
            <p
              class="border-l-4 border-[var(--accent)] pl-6 text-lg lg:text-xl font-black italic leading-relaxed text-gray-900 dark:text-white"
            >
              {{ production.tagline }}
            </p>
          </div>

          <Description :html-content="cleanText(production.description1)" />
        </div>

        <div class="mt-12 mb-16">
          <h2 class="subtitle mb-4">
            {{ t("production.events") }}
          </h2>
          <ProductionEventTable
            v-if="events && events.length > 0"
            :events="events"
          />
          <div v-else class="py-4 opacity-60 italic text-sm">
            {{ t("production.noEvents") }}
          </div>
        </div>

        <Description
          v-if="isValid(production.description2)"
          :html-content="cleanText(production.description2)"
          variant="boxed"
          class="mb-16"
        />

        <div v-if="stories && stories.length > 0" class="my-16">
          <h2 class="subtitle mb-4">
            {{ t("production.stories") }}
          </h2>
          <ProductionStoryListView :stories="stories" />
        </div>

        <ProductionPrints v-if="productionId" :production-id="productionId" />

        <div v-if="carouselImages && carouselImages.length > 0" class="my-16">
          <h2 class="subtitle mb-4">
            {{ t("production.gallery") }}
          </h2>
          <ProductionGallery
            :images="carouselImages"
            :production-id="production.id"
          />
        </div>

        <div
          v-if="isValid(production.credits)"
          class="flex flex-col items-center"
        >
          <div class="max-w-2xl text-center">
            <h4
              class="text-[10px] uppercase font-black opacity-40 mb-6 tracking-widest"
            >
              {{ t("production.credits") }}
            </h4>
            <div
              class="text-sm leading-relaxed opacity-70"
              v-html="production.credits"
            ></div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped></style>

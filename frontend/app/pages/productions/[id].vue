<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { ChevronLeft } from "lucide-vue-next";
import type { ProductionView, TagView } from "@repo/common";
import { cleanText } from "~/utils/formatters";
import { useGallery } from "~/composables/media/useGallery";

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
const { getMainImageCrop, getCarouselImageCrops } = useGallery();
const route = useRoute();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(ROUTES.productions.base); // Fallback
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
    // Once the fetch finishes, check if it failed or returned nothing
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
  return getCarouselImageCrops(gallery.value, "hd_ready"); // of FE3_2by1
});

/**
 * Check if a string is useful (not "N/A" or empty)
 */
const isValid = (val: any) => {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s !== "" && s !== "N/A" && s !== "UNDEFINED";
};

const fullDescription = computed(
  () => cleanText(production.value?.description1) || "",
);
const isExpanded = ref(false);
const showReadMoreButton = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const isExpanded2 = ref(false);
const showReadMoreButton2 = ref(false);
const description2Ref = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  if (descriptionRef.value) {
    showReadMoreButton.value =
      descriptionRef.value.scrollHeight > descriptionRef.value.clientHeight;
  }
  if (description2Ref.value) {
    showReadMoreButton2.value =
      description2Ref.value.scrollHeight > description2Ref.value.clientHeight;
  }
};

let observer: ResizeObserver | null = null;

onMounted(async () => {
  await nextTick();
  observer = new ResizeObserver(() => checkOverflow());

  if (descriptionRef.value) observer.observe(descriptionRef.value);
  if (description2Ref.value) observer.observe(description2Ref.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <main
    v-if="production"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <section
      :class="{ 'image-overlay text-white': headerCrop }"
      class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted"
    >
      <MediaDisplay
        :id="production.id"
        :src="headerCrop"
        class="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div class="relative z-10 page-container pb-12">
        <div class="flex items-center gap-4 mb-8">
          <button
            :class="headerCrop ? 'text-white' : 'text-foreground'"
            class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-accent transition-colors"
            @click="goBack()"
          >
            <ChevronLeft :size="14" stroke-width="3" />
            {{ t("general.back") }}
          </button>

          <span
            v-if="isValid(production.performer_type)"
            :class="
              headerCrop
                ? 'border-white text-white'
                : 'border-foreground text-foreground'
            "
            class="border border-[1.5px] px-2 py-1 text-[10px] font-black uppercase rounded-sm"
          >
            {{ production.performer_type }}
          </span>
        </div>

        <div>
          <h1
            :class="[
              production.titel.length > 35
                ? 'text-4xl lg:text-6xl'
                : production.titel.length > 25
                  ? 'text-5xl lg:text-7xl'
                  : 'text-6xl lg:text-8xl',
            ]"
            class="font-brand font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic"
          >
            {{ production.titel }}
          </h1>
          <p
            v-if="
              isValid(production.artist) &&
              production.artist !== production.titel
            "
            class="text-2xl lg:text-3xl font-medium opacity-80"
          >
            {{ production.artist }}
          </p>
        </div>

        <div
          v-if="tags?.some((t) => isValid(t.tag))"
          class="flex flex-wrap gap-3 mt-8"
        >
          <template v-for="tag in tags" :key="tag.id">
            <span
              v-if="isValid(tag.tag)"
              class="bg-accent text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[1px]"
            >
              {{ tag.tag }}
            </span>
          </template>
        </div>
      </div>
    </section>

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

          <div
            ref="descriptionRef"
            :class="[
              isExpanded
                ? 'line-clamp-none'
                : 'line-clamp-[6] md:line-clamp-[8]',
              showReadMoreButton && !isExpanded ? 'should-fade' : '',
            ]"
            class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200 transition-all duration-500"
            v-html="fullDescription"
          ></div>

          <button
            v-if="showReadMoreButton || isExpanded"
            class="mt-6 mb-4 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
            @click="isExpanded = !isExpanded"
          >
            {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
          </button>
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

        <div v-if="isValid(production.description2)" class="mb-16">
          <div
            ref="description2Ref"
            :class="[
              isExpanded2 ? 'line-clamp-none' : 'line-clamp-[6]',
              showReadMoreButton2 && !isExpanded2 ? 'should-fade' : '',
            ]"
            class="description-content p-8 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 text-lg lg:text-xl rounded-2xl transition-all duration-500"
            v-html="cleanText(production.description2)"
          ></div>

          <button
            v-if="showReadMoreButton2 || isExpanded2"
            class="mt-4 ml-8 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
            @click="isExpanded2 = !isExpanded2"
          >
            {{ isExpanded2 ? t("general.readLess") : t("general.readMore") }}
          </button>
        </div>

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

<style scoped>
/* links in description */
.description-content :deep(a) {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.description-content :deep(a:hover) {
  opacity: 0.7;
}

.should-fade {
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}

.line-clamp-none {
  mask-image: none !important;
  -webkit-mask-image: none !important;
}

.image-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
  pointer-events: none;
}
</style>

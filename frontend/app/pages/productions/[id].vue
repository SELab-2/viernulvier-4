<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { ChevronLeft } from "lucide-vue-next";
import type { ProductionView, TagView } from "@repo/common";
import { useGallery } from "~/composables/media/useGallery";

const { t, locale } = useI18n();
const router = useRouter();
const { getById, getTags, getBlogs, getMediaGallery } = useProductionApi();
const { getMainImageCrop } = useGallery();
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
const { data: production } = await useAsyncData<ProductionView>(
  `prod-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null;
    const res = await getById(productionId.value, locale.value as any);
    return (res as any)?.data ?? res;
  },
  { watch: [productionId, locale] },
);

/** Get tags and remove empty ones */
const { data: tags } = await useAsyncData<TagView[]>(
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
const { data: events } = await useAsyncData(
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
const { data: stories } = await useAsyncData(
  `prod-stories-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return [];
    const res = await getBlogs(productionId.value, locale.value as any);

    const data = (res as any)?.data ?? res;
    return Array.isArray(data) ? data : [];
  },
  { watch: [productionId, locale], default: () => [] },
);

const { data: gallery } = await useAsyncData<GalleryWithItems<ItemWithCrops>>(
  `gallery-v3-${route.params.id}-${locale.value}`,
  async () => {
    if (!productionId.value) return null;
    const res = await getMediaGallery(productionId.value);
    return (res as any)?.data ?? res;
  },
  { watch: [productionId, locale] },
);
const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

/**
 * Check if a string is useful (not "N/A" or empty)
 */
const isValid = (val: any) => {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  return s !== "" && s !== "N/A" && s !== "UNDEFINED" && s !== "\\N";
};

const image = computed(() => (production.value as any)?.image ?? null); //TODO verander! (ook: witte letters bij light en dark mode op image)
const bannerGradient = computed(() =>
  pickPlaceholderGradient(productionId.value ?? 0),
);

/**
 * Sanitizes raw text by removing escape characters and
 * converting newlines to HTML line breaks for v-html rendering.
 */
const cleanText = (text: string | null | undefined) => {
  if (!text) return "";
  return text
    .replace(/\\/g, "")
    .trim()
    .replace(/(\r?\n){2,}/g, "\n\n")
    .replace(/\n/g, "<br />");
};

const fullDescription = computed(
  () => cleanText(production.value?.description1) || "",
);
const isExpanded = ref(false);
const showReadMoreButton = ref(false);
const descriptionRef = ref<HTMLElement | null>(null);

const checkOverflow = () => {
  const el = descriptionRef.value;
  if (el) {
    showReadMoreButton.value = el.scrollHeight > el.clientHeight;
  }
};
onMounted(async () => {
  await nextTick();
  checkOverflow();
  window.addEventListener("resize", checkOverflow);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkOverflow);
});
</script>

<template>
  <main
    v-if="production"
    class="min-h-screen bg-white dark:bg-[#1e2230] text-gray-900 dark:text-gray-100"
  >
    <section
      class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden"
    >
      <MediaGalleryImage
        class="absolute inset-0 w-full h-full object-cover z-0"
        :object-id="production.id"
        :crop="headerCrop"
      />

      <div
        class="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20 pb-12"
      >
        <div class="flex items-center gap-4 mb-8">
          <button
            @click="goBack()"
            class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] text-foreground hover:text-accent transition-colors"
          >
            <ChevronLeft :size="14" stroke-width="3" />
            {{ t("general.back") }}
          </button>

          <span
            v-if="isValid(production.performer_type)"
            class="border border-[1.5px] border-foreground text-foreground px-2 py-1 text-[10px] font-black uppercase rounded-sm"
          >
            {{ production.performer_type }}
          </span>
        </div>

        <div class="text-foreground">
          <h1
            class="font-brand font-black uppercase leading-[0.85] tracking-[-3px] mb-4 italic"
            :class="[
              production.titel.length > 35
                ? 'text-4xl lg:text-6xl'
                : production.titel.length > 25
                  ? 'text-5xl lg:text-7xl'
                  : 'text-6xl lg:text-8xl',
            ]"
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
      <div class="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-20">
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
            class="description-content text-lg lg:text-xl leading-relaxed opacity-80 font-brand text-gray-800 dark:text-gray-200 transition-all duration-500"
            :class="[
              isExpanded
                ? 'line-clamp-none'
                : 'line-clamp-[6] md:line-clamp-[8]',
              showReadMoreButton && !isExpanded ? 'should-fade' : '',
            ]"
            v-html="fullDescription"
          ></div>

          <button
            v-if="showReadMoreButton || isExpanded"
            @click="isExpanded = !isExpanded"
            class="mt-6 mb-4 text-[11px] font-black uppercase tracking-[2px] text-[var(--accent)] hover:underline outline-none"
          >
            {{ isExpanded ? t("general.readLess") : t("general.readMore") }}
          </button>
        </div>

        <div class="mt-12 mb-16">
          <h1 class="text-[16px] uppercase font-black mb-6 tracking-widest">
            {{ t("production.events") }}
          </h1>
          <ProductionEventTable
            v-if="events && events.length > 0"
            :events="events"
          />
          <div v-else class="py-4 opacity-60 italic text-sm">
            {{ t("production.noEvents") }}
          </div>
        </div>

        <div
          v-if="isValid(production.description2)"
          class="description-content mb-16 p-8 bg-gray-100 dark:bg-white/5 border-l-2 border-gray-200 dark:border-gray-700 italic opacity-80 text-lg lg:text-xl rounded-2xl"
          v-html="cleanText(production.description2)"
        ></div>

        <div v-if="stories && stories.length > 0" class="my-16">
          <h1 class="text-[16px] uppercase font-black mb-6 tracking-widest">
            {{ t("production.stories") }}
          </h1>
          <ProductionStoryListView :stories="stories" />
        </div>

        <div
          v-if="isValid(production.credits)"
          class="pt-12 flex flex-col items-center"
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
</style>

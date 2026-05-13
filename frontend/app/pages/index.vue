<script setup lang="ts">
import { type MediaCrop, type TagView } from "@repo/common";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useBlogView } from "~/composables/blogs/useBlogView";
import { useHomeView } from "~/composables/home/useHomeView";
import { usePrintView } from "~/composables/media/usePrintView";

definePageMeta({
  layout: "home",
});

// Get all filters.
const {
  searchQuery: productionQuery,
  dateFilter: productionDate,
  tagIds,
} = useArchiveView();
const { searchQuery: blogQuery, dateFilter: blogDate } = useBlogView();
const { searchQuery: printQuery, activeFilter } = usePrintView();

// Other composables.
const { fetchSingleRandomImage } = useHomeView();
const { getAll } = useTagApi();
const { locale, t } = useI18n();

// References and the timer.
const crops = ref<MediaCrop[]>([]);
const tags = ref<TagView[]>([]);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

// Track if we are currently fetching to prevent race conditions
const isFetching = ref(false);

/**
 * Loads all tags so they can be shown.
 */
async function loadTags() {
  try {
    const resp = await getAll({
      paginationFilters: { page: 0, limit: 100, descending: true },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    if (resp.data) {
      const validTags = resp.data.objects.filter((tag) => tag.tag !== "N/A");
      const shuffled = validTags.sort(() => 0.5 - Math.random());

      // * NOTE: Currently we only take 15 tags but we could realistically do more.
      tags.value = shuffled.slice(0, 25);
    }
  } catch {
    // Silently fail if tags don't load.
  }
}

// Watch the locale so we reload tags if locale changes.
watch(locale, loadTags);

/**
 * Helper to fetch and push a single image to our array safely.
 */
async function preloadNextImage() {
  if (isFetching.value) return;
  isFetching.value = true;

  const newImage = await fetchSingleRandomImage();
  if (newImage) {
    crops.value.push(newImage);
  }

  isFetching.value = false;
}

// On mount we need to fetch some random images.
// And reset all of the active filters.
onMounted(async () => {
  loadTags();

  // Clear all filters from the other pages.
  productionQuery.value = "";
  productionDate.value = {};
  tagIds.value = [];
  blogQuery.value = "";
  blogDate.value = {};
  printQuery.value = "";
  activeFilter.value = null;

  const initialImage = await fetchSingleRandomImage();
  if (initialImage) {
    crops.value.push(initialImage);

    // Immediately start loading the 2nd image in the background
    preloadNextImage();

    // Start the rolling timer
    timer = setInterval(() => {
      // Advance to the next image safely
      currentIndex.value = (currentIndex.value + 1) % crops.value.length;

      // As soon as we switch slides, trigger the fetch for the next upcoming slide
      preloadNextImage();
    }, 5000);
  }
});

// We clear the timer when unmounted.
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// The active crop to currently use and show!
const activeCrop = computed(() => crops.value[currentIndex.value]);
</script>

<template>
  <main class="w-full relative flex-1 flex flex-col bg-background">
    <section
      class="hero relative w-full h-dvh flex flex-col items-center justify-center overflow-hidden"
    >
      <!--
        The image shown in the background.
      -->
      <transition name="hero-fade">
        <MediaDisplay
          v-if="activeCrop"
          :key="activeCrop.id"
          :src="activeCrop"
          :show-icon="false"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </transition>

      <!--
        Background Dim/Lightening.
      -->
      <div
        class="absolute inset-0 bg-background/30 dark:bg-black/60 backdrop-blur-[2px] z-10 transition-colors duration-500"
      />

      <!--
        The Search bar and Year picker.
      -->
      <div
        class="relative z-20 w-full max-w-8xl mx-auto px-6 text-center flex flex-col items-center gap-10"
      >
        <div class="space-y-3">
          <h1
            class="text-8xl md:text-7xl font-extrabold tracking-tight text-foreground drop-shadow-lg transition-colors"
          >
            {{ t("home.title") }}
          </h1>
        </div>
        <div class="w-full max-w-3xl">
          <HomeSearchBar />
        </div>
        <div>
          <HomeRandomYears :gap="5" />
        </div>
      </div>

      <!--
        Bottom strip with moving tags.
      -->
      <div class="ticker-root absolute bottom-0 inset-x-0 z-20 pb-10">
        <div class="overflow-hidden">
          <div class="ticker-track">
            <div class="ticker-strip hero-tags" aria-hidden="false">
              <HomeTags :tags="tags" />
            </div>
            <div class="ticker-strip hero-tags" aria-hidden="true">
              <HomeTags :tags="tags" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

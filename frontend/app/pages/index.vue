<script setup lang="ts">
import type { MediaCrop, TagView } from "@repo/common";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useHomeView } from "~/composables/home/useHomeView";

definePageMeta({
  layout: "home",
});

const { fetchRandomImages } = useHomeView();
const { getAll } = useTagApi();
const { locale } = useI18n();

const crops = ref<MediaCrop[]>([]);
const tags = ref<TagView[]>([]);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

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
      tags.value = shuffled.slice(0, 15);
    }
  } catch {
    // Silently fail if tags don't load.
  }
}

watch(locale, loadTags);

onMounted(async () => {
  loadTags();

  const data = await fetchRandomImages();
  if (data) {
    crops.value = data;
    if (crops.value.length > 0) {
      timer = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % crops.value.length;
      }, 5000);
    }
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const activeCrop = computed(() => crops.value[currentIndex.value]);
</script>

<template>
  <main class="w-full relative flex-1 flex flex-col bg-background">
    <!-- ── Full-bleed Hero ─────────────────────────────────────────── -->
    <section
      class="hero relative w-full min-h-[88vh] flex flex-col items-center justify-center overflow-hidden"
    >
      <!-- Cycling background image -->
      <transition name="hero-fade">
        <MediaDisplay
          v-if="activeCrop"
          :key="activeCrop.id"
          :src="activeCrop"
          :show-icon="false"
          class="absolute inset-0 w-full h-full object-cover"
        />
      </transition>

      <!-- Always-dark base layer -->
      <div class="absolute inset-0 bg-black/50 z-10" />
      <!-- Directional gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-10"
      />

      <!-- ── Hero text + search ── -->
      <div
        class="relative z-20 w-full max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8"
      >
        <div class="space-y-3">
          <h1
            class="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg"
          >
            Doorzoek het archief
          </h1>
          <p class="text-lg md:text-xl font-medium text-white/65">
            Vind producties, artikels en herinneringen
          </p>
        </div>
        <div class="w-full max-w-xl">
          <HomeSearchBar />
        </div>
      </div>

      <!-- ── Tag ticker — pinned to the bottom of the hero ── -->
      <div class="ticker-root absolute bottom-0 inset-x-0 z-20 pb-10">
        <!-- Soft edge masks so tags fade in/out at the sides -->
        <div class="ticker-mask-left" />
        <div class="ticker-mask-right" />

        <!-- Overflow clip for the scrolling track -->
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

      <!-- Bottom page-background fade -->
      <!-- <div class="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-background to-transparent z-10" /> -->
    </section>
  </main>
</template>

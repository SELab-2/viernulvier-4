<!-- pages/index.vue -->
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useHomeView } from "~/composables/home/useHomeView";
definePageMeta({
  layout: "home",
});
const { fetchRandomImages } = useHomeView();
const crops = ref<MediaCrop[]>([]);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;
onMounted(async () => {
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
      class="relative w-full min-h-[88vh] flex flex-col items-center justify-center overflow-hidden"
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

      <!-- Gradient overlays: darken top + bottom, keep centre readable -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10"
      />

      <!-- Content — sits above overflow:hidden boundary so dropdown escapes via the years section below -->
      <div
        class="relative z-20 w-full max-w-2xl mx-auto px-6 text-center flex flex-col items-center gap-8"
      >
        <div class="space-y-3">
          <h1
            class="text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg"
          >
            Doorzoek het archief
          </h1>
          <p class="text-lg md:text-xl font-medium text-white/70">
            Vind producties, artikels en herinneringen
          </p>
        </div>

        <!-- Search bar — dropdown can overflow the section since z-20 is above the overflow:hidden layer -->
        <div class="w-full max-w-xl">
          <HomeSearchBar />
        </div>

        <!-- Tags as in-hero browse shortcuts -->
        <div class="w-full max-w-xl">
          <p
            class="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3"
          >
            Blader op thema
          </p>
          <HomeRandomTags />
        </div>
      </div>

      <!-- Fade hero into page background at the bottom -->
      <div
        class="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent z-10"
      />
    </section>

    <!-- ── Below the fold: years ───────────────────────────────────── -->
    <div class="w-full max-w-5xl mx-auto px-6 py-12">
      <HomeRandomYears />
    </div>
  </main>
</template>
<style scoped>
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}
</style>

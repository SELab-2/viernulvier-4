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
            <!--
              Two identical copies of HomeRandomTags placed side-by-side.
              When the first copy scrolls fully off-left the second copy
              seamlessly takes its place — creating an infinite loop.
            -->
            <div class="ticker-strip hero-tags" aria-hidden="false">
              <HomeRandomTags />
            </div>
            <div class="ticker-strip hero-tags" aria-hidden="true">
              <HomeRandomTags />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom page-background fade -->
      <!-- <div class="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-background to-transparent z-10" /> -->
    </section>
  </main>
</template>

<style scoped>
/* ── Hero image crossfade ── */
.hero-fade-enter-active,
.hero-fade-leave-active {
  transition: opacity 1.5s ease-in-out;
}
.hero-fade-enter-from,
.hero-fade-leave-to {
  opacity: 0;
}

/* ── Ticker layout ── */
.ticker-root {
  position: absolute;
}

.ticker-track {
  display: flex;
  width: max-content;
  /* Scroll the entire track leftward over 30 s, then snap back to start */
  animation: ticker-scroll 30s linear infinite;
}

/* Pause scrolling when the user hovers anywhere on the ticker */
.ticker-root:hover .ticker-track {
  animation-play-state: paused;
}

.ticker-strip {
  /* Each strip must NOT wrap so we get a single horizontal row of pills */
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem; /* breathing room between the two copies */
  white-space: nowrap;
}

/* Force inner tags to stay on one line */
.ticker-strip :deep(*) {
  flex-shrink: 0;
  white-space: nowrap;
}

@keyframes ticker-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ── Side-edge fade masks ── */
.ticker-mask-left,
.ticker-mask-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8rem;
  z-index: 1;
  pointer-events: none;
}
.ticker-mask-left {
  left: 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);
}
.ticker-mask-right {
  right: 0;
  background: linear-gradient(to left, rgba(0, 0, 0, 0.6), transparent);
}

/* ── Tag pill overrides — always dark regardless of theme ── */
.hero-tags :deep(a),
.hero-tags :deep(button),
.hero-tags :deep([class*="badge"]),
.hero-tags :deep([class*="tag"]),
.hero-tags :deep([class*="pill"]),
.hero-tags :deep(span) {
  background-color: rgba(0, 0, 0, 0.45) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(4px);
  flex-shrink: 0;
}

.hero-tags :deep(a:hover),
.hero-tags :deep(button:hover) {
  background-color: rgba(255, 255, 255, 0.18) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
</style>

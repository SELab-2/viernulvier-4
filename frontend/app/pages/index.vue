<!-- pages/index.vue -->
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useHomeView } from "~/composables/home/useHomeView";

definePageMeta({
  layout: "home",
});

const { fetchRandomImages } = useHomeView();

// Explicitly type the ref to ensure TS doesn't think it's a boolean
const crops = ref<MediaCrop[]>([]);
const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  const data = await fetchRandomImages();
  if (data) {
    crops.value = data;

    // Start cycling if we have images
    if (crops.value.length > 0) {
      timer = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % crops.value.length;
      }, 5000); // Change image every 5 seconds
    }
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const activeCrop = computed(() => crops.value[currentIndex.value]);
</script>

<template>
  <main
    class="w-full relative flex-1 flex flex-col items-center justify-center py-8 overflow-hidden bg-background"
  >
    <!-- Background grid/texture -->
    <div
      class="absolute inset-0 z-0 bg-[url('~/assets/images/archive-grid.jpg')] bg-cover bg-center opacity-5 grayscale dark:opacity-10"
    ></div>

    <div
      class="page-container z-10 w-full max-w-5xl flex flex-col items-center justify-center space-y-10"
    >
      <!-- Center Hero Box -->
      <div
        class="relative w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px] md:min-h-[450px] flex flex-col items-center justify-center p-8 md:p-12 border border-border/40 bg-card/40 backdrop-blur-md"
      >
        <!-- Background Media cycling -->
        <div class="absolute inset-0 z-0">
          <transition name="hero-fade">
            <!-- 
              We use :key="activeCrop.id" to trigger the transition 
              when the activeCrop changes 
            -->
            <MediaDisplay
              v-if="activeCrop"
              :key="activeCrop.id"
              :src="activeCrop"
              :show-icon="true"
              class="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
            />
          </transition>
        </div>

        <!-- Search Content -->
        <div class="relative z-20 w-full max-w-2xl text-center space-y-8">
          <div class="space-y-3">
            <h1
              class="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-md"
            >
              Doorzoek het archief
            </h1>
            <p class="text-lg md:text-xl font-medium text-foreground/70">
              Vind producties, artikels en herinneringen
            </p>
          </div>

          <div
            class="w-full max-w-xl mx-auto transform transition-transform hover:scale-[1.01]"
          >
            <HomeSearchBar />
          </div>
        </div>
      </div>

      <!-- Bottom sections -->
      <div class="w-full relative max-w-4xl">
        <div
          class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"
        ></div>
        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 px-4 text-left"
        >
          <HomeRandomTags />
          <HomeRandomYears />
        </div>
      </div>
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

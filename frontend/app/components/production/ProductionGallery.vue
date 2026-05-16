<script setup lang="ts">
import { ref } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

interface Props {
  images: any[];
  productionId: number;
}

const props = defineProps<Props>();
const { t } = useI18n();

const currentSlide = ref(0);

const nextSlide = () => {
  if (props.images.length === 0) return;
  currentSlide.value = (currentSlide.value + 1) % props.images.length;
};

const prevSlide = () => {
  if (props.images.length === 0) return;
  currentSlide.value =
    (currentSlide.value - 1 + props.images.length) % props.images.length;
};

const setSlide = (index: number) => {
  currentSlide.value = index;
};
</script>

<template>
  <div class="w-full">
    <div
      class="flex items-center gap-2 sm:gap-4 md:gap-6 px-4 sm:px-12 md:px-16"
    >
      <button
        v-if="images.length > 1"
        @click="prevSlide"
        class="shrink-0 text-foreground/40 hover:text-accent p-2 rounded-full transition-colors outline-none"
        :aria-label="t('production.gallery_nav.prev')"
      >
        <ChevronLeft :size="28" stroke-width="2.5" />
      </button>

      <div
        class="flex-1 relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/5"
      >
        <div
          class="aspect-[16/9] w-full overflow-hidden flex items-center justify-center"
        >
          <MediaDisplay
            :id="productionId"
            :src="images[currentSlide] ?? null"
            size="fill"
            :rounded="false"
            class="w-full h-full object-contain"
          />
        </div>

        <div
          v-if="images.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"
        >
          <button
            v-for="(_, index) in images"
            :key="index"
            @click="setSlide(index)"
            class="h-1.5 transition-all duration-300 rounded-full"
            :class="
              currentSlide === index ? 'bg-white w-6' : 'bg-white/40 w-1.5'
            "
            :aria-label="
              t('production.gallery_nav.go_to_slide', { slide: index + 1 })
            "
          ></button>
        </div>
      </div>

      <button
        v-if="images.length > 1"
        @click="nextSlide"
        class="shrink-0 text-foreground/40 hover:text-accent p-2 rounded-full transition-colors outline-none"
        aria-label="t('production.gallery_nav.next')"
      >
        <ChevronRight :size="28" stroke-width="2.5" />
      </button>
    </div>

    <div class="mt-4 flex justify-center">
      <span class="text-[11px] font-black opacity-50 uppercase tracking-[2px]">
        {{ currentSlide + 1 }} / {{ images.length }}
      </span>
    </div>
  </div>
</template>

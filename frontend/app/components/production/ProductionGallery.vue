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
      class="relative group overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/5"
    >
      <div class="aspect-[2/1] w-full overflow-hidden">
        <MediaDisplay
          :id="productionId"
          :src="images[currentSlide] ?? null"
          size="fill"
          :rounded="false"
          class="w-full h-full object-cover"
        />
      </div>

      <template v-if="images.length > 1">
        <button
          @click="prevSlide"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft :size="24" />
        </button>

        <button
          @click="nextSlide"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight :size="24" />
        </button>

        <div
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
          ></button>
        </div>
      </template>
    </div>

    <div class="mt-4 flex justify-center">
      <span class="text-[11px] font-black opacity-50 uppercase tracking-[2px]">
        {{ currentSlide + 1 }} / {{ images.length }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import { ChevronLeft } from "lucide-vue-next";
import type { MediaCrop } from "@repo/common";

const props = withDefaults(
  defineProps<{
    id: number | string;
    title: string;
    subtitle?: string | null;
    headerCrop: MediaCrop | null;
    backText: string;
  }>(),
  {
    subtitle: null,
  },
);

const emit = defineEmits<{
  (e: "back"): void;
}>();

/** Dynamic font-size class based on string length */
const titleSizeClass = computed(() => {
  const len = props.title.length;
  return len > 35
    ? "text-4xl lg:text-6xl"
    : len > 25
      ? "text-5xl lg:text-7xl"
      : "text-6xl lg:text-8xl";
});

const titleText = ref<HTMLElement | null>(null);
const titleScrollable = ref(false);
let __ro_title: ResizeObserver | null = null;

function updateTitleScrollable() {
  nextTick(() => {
    const el = titleText.value;
    if (!el) {
      titleScrollable.value = false;
      return;
    }

    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
    if (!lineHeight) {
      titleScrollable.value = false;
      return;
    }

    // Calculate lines based on the unconstrained inner content height
    const lines = Math.round(el.scrollHeight / lineHeight);

    // If the text naturally takes up more than 3 lines, we unlock the scroll wrapper
    titleScrollable.value = lines > 3;
  });
}

onMounted(() => {
  updateTitleScrollable();
  __ro_title = new ResizeObserver(updateTitleScrollable);
  if (titleText.value) __ro_title.observe(titleText.value);
});

onBeforeUnmount(() => {
  __ro_title?.disconnect();
});

watch(() => props.title, updateTitleScrollable);
</script>

<template>
  <section
    :class="{ 'image-overlay text-white': props.headerCrop }"
    class="relative h-[400px] lg:h-[500px] w-full flex items-end overflow-hidden bg-muted"
  >
    <MediaDisplay
      :id="props.id"
      :src="props.headerCrop"
      class="absolute inset-0 w-full h-full object-cover z-0"
    />

    <div class="relative z-10 page-container pb-12">
      <div class="flex items-center gap-6 mb-8">
        <button
          :class="props.headerCrop ? 'text-white' : 'text-foreground'"
          class="flex items-center gap-1 text-[11px] font-black uppercase tracking-[2px] hover:text-accent transition-colors"
          @click="emit('back')"
        >
          <ChevronLeft :size="14" stroke-width="3" />
          {{ props.backText }}
        </button>

        <slot name="meta" />
      </div>

      <div>
        <div
          class="title-scroll-wrap mb-4"
          :class="[
            titleScrollable
              ? 'title-scroll-scrollable title-scroll-fade'
              : 'title-clamp-3',
          ]"
        >
          <h1
            ref="titleText"
            class="font-brand font-black uppercase leading-[0.85] tracking-[-3px] italic"
            :class="titleSizeClass"
          >
            {{ props.title }}
          </h1>
        </div>

        <p
          v-if="props.subtitle"
          class="text-2xl lg:text-3xl font-medium opacity-80"
        >
          {{ props.subtitle }}
        </p>
      </div>

      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped>
.title-scroll-wrap {
  max-width: 100%;
  overflow: hidden;
}

.title-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.title-scroll-scrollable {
  max-height: 8rem;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.title-scroll-wrap h1 {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  margin: 0;
  padding: 0;
}

.title-scroll-scrollable::-webkit-scrollbar {
  display: block;
  width: 6px;
}

.title-scroll-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.title-scroll-scrollable::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 9999px;
}

.title-scroll-fade {
  mask-image: linear-gradient(to bottom, black 65%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 65%, transparent 100%);
}

/* Gradient overlay on hero image */
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

<!--
  components/blogs/StoryListItem.vue
  ====================================
  Single story card. Receives a BlogView — all fields are already flat strings
  because the parent fetches with a lang param.
-->
<script lang="ts" setup>
import type { BlogView } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";

const props = defineProps<{
  story: BlogView;
}>();

const { locale } = useI18n();

// BlogView fields are flat strings — no locale fallback logic needed.
const title       = computed(() => (props.story as any).titel       ?? "—");
const description = computed(() => (props.story as any).description ?? "");

const formattedDate = computed(() => {
  if (!(props.story as any).created_at) return "";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date((props.story as any).created_at).toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const image               = computed<string | null>(() => (props.story as any)?.image ?? null);
const placeholderGradient = computed(() => pickPlaceholderGradient((props.story as any).id ?? 0));
</script>

<template>
  <article
    class="group flex overflow-hidden rounded-lg border transition-all duration-150 bg-white border-gray-200 hover:border-purple-400/60 dark:bg-[#1e2130]/60 dark:border-[#2e3347] dark:hover:border-purple-500/50 shadow-sm hover:shadow-md hover:shadow-purple-500/10 dark:shadow-none relative"
  >
    <!-- Purple left accent bar -->
    <div
      class="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      aria-hidden="true"
    />

    <!-- Thumbnail -->
    <div class="w-28 sm:w-36 shrink-0 relative overflow-hidden" style="aspect-ratio: 4/3; min-height: 84px;">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
        :style="{ background: placeholderGradient }"
        aria-hidden="true"
      />
    </div>

    <!-- Text content -->
    <div class="flex-1 min-w-0 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4">
      <div>
        <h3
          class="font-brand font-black text-sm sm:text-base uppercase tracking-tight leading-snug mb-1 line-clamp-2 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-150 text-gray-900 dark:text-gray-100"
        >
          {{ title }}
        </h3>

        <p
          v-if="description"
          class="text-xs leading-relaxed line-clamp-2 text-gray-500 dark:text-gray-400"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-center mt-3">
        <span
          v-if="formattedDate"
          class="flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest text-gray-400 dark:text-gray-500"
        >
          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {{ formattedDate }}
        </span>
      </div>
    </div>
  </article>
</template>
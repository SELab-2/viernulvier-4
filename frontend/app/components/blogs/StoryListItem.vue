<!--
  components/blogs/StoryListItem.vue
  ====================================
  This file implements a single story card shown inside the monthly groups of
  the timeline.  It is rendered inside a <NuxtLink> by StoryMonthGroup, so it
  does not need to handle navigation itself.

  Visual design
  -------------
  - Light mode  : white card, thin grey border, subtle hover lift.
  - Dark mode   : semi-transparent dark navy surface so the gradient thumbnail
                  placeholder shows through with its purple tones rather than
                  being swallowed by a flat opaque background.  A slight border
                  and hover state maintain the layering effect.
  - Thumbnail   : real image when available, otherwise a deterministic
                  gradient placeholder derived from the story id.
  - No id badge : the #N identifier is intentionally omitted from the card.
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";

const props = defineProps<{
  story: Blog | BlogView;
}>();

const { locale } = useI18n();

/** Extract the title string for the current locale, falling back gracefully. */
const title = computed(() => {
  const raw = props.story.titel;
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw?.[lang] ?? raw?.nl ?? raw?.en ?? "—";
});

/** Extract the description string for the current locale. */
const description = computed(() => {
  const d = (props.story as Blog).description;
  if (!d) return "";
  if (typeof d === "string") return d;
  const lang = locale.value as "nl" | "en";
  return d?.[lang] ?? d?.nl ?? d?.en ?? "";
});

/** Localised date string. */
const formattedDate = computed(() => {
  if (!props.story.created_at) return "";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(props.story.created_at).toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

/** Real image (future backend field) or null — show gradient placeholder when absent. */
const image = computed<string | null>(() => (props.story as any)?.image ?? null);

/** Deterministic gradient per story id so the colour stays consistent across renders. */
const placeholderGradient = computed(() =>
  pickPlaceholderGradient(props.story.id ?? 0),
);
</script>

<template>
  <article
    class="
      group flex overflow-hidden rounded-lg border transition-all duration-150
      bg-white border-gray-200 hover:border-purple-400/60
      dark:bg-[#1e2130]/60 dark:border-[#2e3347] dark:hover:border-purple-500/50
      shadow-sm hover:shadow-md hover:shadow-purple-500/10 dark:shadow-none
      relative
    "
  >
    <!-- Purple left accent bar — slides in on hover -->
    <div
      class="
        absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg
        bg-purple-500 opacity-0 group-hover:opacity-100
        transition-opacity duration-150
      "
      aria-hidden="true"
    />
    <!-- Thumbnail -->
    <div
      class="w-28 sm:w-36 shrink-0 relative overflow-hidden"
      style="aspect-ratio: 4/3; min-height: 84px;"
    >
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
        <!-- Title -->
        <h3
          class="
            font-brand font-black text-sm sm:text-base uppercase tracking-tight
            leading-snug mb-1 line-clamp-2
            group-hover:text-purple-500 dark:group-hover:text-purple-400
            transition-colors duration-150
            text-gray-900 dark:text-gray-100
          "
        >
          {{ title }}
        </h3>

        <!-- Description excerpt -->
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
          <svg
            class="w-3 h-3 shrink-0"
            fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
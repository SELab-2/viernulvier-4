<!--
  components/blogs/StoryListItem.vue
  -----------------------------------
  A single story card.  Rendered inside a <NuxtLink> by StoryMonthGroup so it
  does not need to handle navigation itself.

  Dark mode: the card uses an explicit lighter dark surface (--card-dark) so
  it stands out from the page background.  A subtle border and hover highlight
  replace the near-black Tailwind defaults.
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import { pickPlaceholderGradient } from "~/utils/constants";

const props = defineProps<{
  story: Blog | BlogView;
}>();

const { locale } = useI18n();

const title = computed(() => {
  const raw = props.story.titel;
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw?.[lang] ?? raw?.nl ?? raw?.en ?? "—";
});

const description = computed(() => {
  const d = (props.story as Blog).description;
  if (!d) return "";
  if (typeof d === "string") return d;
  const lang = locale.value as "nl" | "en";
  return d?.[lang] ?? d?.nl ?? d?.en ?? "";
});

const formattedDate = computed(() => {
  if (!props.story.created_at) return "";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(props.story.created_at).toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const image = computed<string | null>(() => (props.story as any)?.image ?? null);
const placeholderGradient = computed(() => pickPlaceholderGradient(props.story.id ?? 0));
</script>

<template>
  <article
    class="story-card group flex overflow-hidden transition-colors duration-150"
    style="background: var(--story-card); border-color: var(--story-card-border);"
  >
    <div
      class="w-32 sm:w-40 shrink-0 relative overflow-hidden"
      style="aspect-ratio: 4/3; min-height: 88px;"
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
        class="absolute inset-0 transition-opacity duration-300 group-hover:opacity-80"
        :style="{ background: placeholderGradient }"
        aria-hidden="true"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col justify-between px-4 py-3 sm:px-5 sm:py-4">
      <div>
        <h3
          class="font-brand font-black text-sm sm:text-base uppercase tracking-tight leading-snug mb-1.5 line-clamp-2 group-hover:underline underline-offset-2 decoration-1"
          style="color: var(--foreground);"
        >
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="text-xs leading-relaxed line-clamp-2"
          style="color: var(--muted-foreground);"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-3 mt-2 sm:mt-3">
        <span
          v-if="formattedDate"
          class="flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest"
          style="color: var(--muted-foreground);"
        >
          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {{ formattedDate }}
        </span>
        <span
          v-if="story.id"
          class="ml-auto text-[8px] font-brand font-black"
          style="color: var(--border);"
        >
          #{{ story.id }}
        </span>
      </div>
    </div>
  </article>
</template>
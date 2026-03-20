<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";

const props = defineProps<{
  story: Blog | BlogView;
}>();

const { t, locale } = useI18n();

const title = computed(() => {
  const raw = props.story.titel;
  if (typeof raw === "string") return raw;
  const lang = locale.value as "nl" | "en";
  return raw?.[lang] ?? raw?.nl ?? raw?.en ?? "—";
});

const description = computed(() => {
  const d = (props.story as Blog)?.description;
  if (!d) return "";
  if (typeof d === "string") return d;
  const lang = locale.value as "nl" | "en";
  return d?.[lang] ?? d?.nl ?? d?.en ?? "";
});

const formattedDate = computed(() => {
  if (!props.story.created_at) return "";
  return new Date(props.story.created_at).toLocaleDateString(
    t("stories.locale"),
    { year: "numeric", month: "long", day: "numeric" },
  );
});

// Only show a thumbnail when the story has an explicit image field.
// Once the backend exposes an image field it will appear here automatically.
const image = computed<string | null>(() => (props.story as any)?.image ?? null);
</script>

<template>
  <article
    class="story-item group flex gap-0 bg-background transition-colors duration-150 hover:bg-muted overflow-hidden"
  >
    <!-- Thumbnail — only rendered when story has an explicit image field -->
    <div
      v-if="image"
      class="w-32 sm:w-40 shrink-0 relative overflow-hidden bg-muted"
      style="aspect-ratio: 4/3; min-height: 88px;"
    >
      <img
        :src="image"
        :alt="title"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>

    <!-- Content — adjusts line-clamp and title size based on whether an image is present -->
    <div
      class="flex-1 min-w-0 flex flex-col justify-between px-5 py-4"
      :class="!image ? 'py-5' : ''"
    >
      <div>
        <h3
          class="font-brand font-black uppercase tracking-tight leading-snug mb-1.5 group-hover:underline underline-offset-2 decoration-1 text-foreground"
          :class="image ? 'text-sm sm:text-base line-clamp-2' : 'text-base sm:text-lg line-clamp-1'"
        >
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="text-xs text-muted-foreground leading-relaxed"
          :class="image ? 'line-clamp-2' : 'line-clamp-3'"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-3 mt-3">
        <span
          v-if="formattedDate"
          class="flex items-center gap-1.5 text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
        >
          <svg
            class="w-3 h-3 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {{ formattedDate }}
        </span>
        <span
          v-if="story.id"
          class="ml-auto text-[8px] font-brand font-black text-border"
        >
          #{{ story.id }}
        </span>
      </div>
    </div>
  </article>
</template>
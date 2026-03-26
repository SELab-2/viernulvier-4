<!--
  components/blogs/StoryMonthGroup.vue
  ======================================
  This file implements one month bucket inside a year section (e.g. "January").
  Each story card is wrapped in a <NuxtLink> so the router handles navigation
  directly — no custom event chain is required.

  Spacing
  -------
  Cards are separated by a visible gap (space-y-2) so they read as individual
  items rather than a single merged block.  The gap also provides a subtle
  visual rhythm that helps the user scan the list quickly.
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "~/components/blogs/StoryListItem.vue";

const props = defineProps<{
  monthKey: string;             // "YYYY-MM"
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const { locale } = useI18n();

/** Convert "YYYY-MM" into a localised month name ("January", "Januari", …). */
const label = computed(() => {
  const [y, m] = props.monthKey.split("-");
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(parseInt(y ?? "2000"), parseInt(m ?? "1") - 1, 1)
    .toLocaleDateString(loc, { month: "long" });
});
</script>

<template>
  <div>
    <!-- Month heading -->
    <div class="flex items-center gap-3 mb-3">
      <!-- Purple dot -->
      <div class="w-2 h-2 rounded-full bg-purple-400 shrink-0" aria-hidden="true" />
      <!-- Month label -->
      <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
        {{ label }}
      </span>
      <!-- Rule -->
      <div class="flex-1 h-px bg-border" />
      <!-- Count -->
      <span class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground/50">
        {{ stories.length }}
      </span>
    </div>

    <!-- Story cards — spaced so each card is visually distinct -->
    <div class="space-y-2">
      <NuxtLink
        v-for="story in stories"
        :key="story.id"
        :to="`/stories/${story.id}`"
        class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg"
      >
        <StoryListItem :story="story" />
      </NuxtLink>
    </div>
  </div>
</template>
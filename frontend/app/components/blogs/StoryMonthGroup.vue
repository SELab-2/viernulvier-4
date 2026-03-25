<!--
  components/blogs/StoryMonthGroup.vue
  ------------------------------------
  Renders one month bucket (e.g. "January") within a year section.
  Each story is wrapped in a <NuxtLink> so navigation is handled by the router
  directly — no event bubbling required.
-->

<script lang="ts" setup>
import type { Blog, BlogView } from "@repo/common";
import StoryListItem from "~/components/blogs/StoryListItem.vue";

const props = defineProps<{
  monthKey: string;
  stories: Array<Blog | BlogView>;
  sortOrder: "newest" | "oldest";
}>();

const emit = defineEmits<{
  (e: "story-click", story: Blog | BlogView): void;
}>();

const { locale } = useI18n();

const monthLabel = computed(() => {
  const parts = props.monthKey.split("-");
  const yearStr = parts[0] ?? "2000";
  const monthStr = parts[1] ?? "1";
  const loc = locale.value === "nl" ? "nl-BE" : "en-GB";
  return new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1)
    .toLocaleDateString(loc, { month: "long" });
});
</script>

<template>
  <div class="blog-month-group">

    <div class="blog-month-heading">
      <div class="blog-month-dot" />
      <span class="blog-month-label font-brand">{{ monthLabel }}</span>
      <div class="blog-month-rule" />
      <span class="blog-month-count font-brand">{{ stories.length }}</span>
    </div>

    <div class="blog-story-group">
      <button
        v-for="story in stories"
        :key="story.id"
        class="blog-story-btn"
        @click="emit('story-click', story)"
      >
        <StoryListItem :story="story" />
      </button>
    </div>

  </div>
</template>
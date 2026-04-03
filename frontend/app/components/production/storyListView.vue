<script setup lang="ts">
/**
 * A reusable story list component, displays stories belonging to a specific production, includes:
 *  - Title, date and description displayed per story
 *  - Sorting of stories
 *  - Scrollable when there are more than 3 stories
 *
 * Usage:
 * <ProductionStories
 *    :stories="stories"
 * />
 *
 * Example stories: (There are 2 ways to create a date)
 * const stories: StoryItem[] = [
 *    { id: '1', title: 'Rehearsal day 1', date: new Date(2026, 2, 10), description: 'First rehearsal of the season.', image: '/img/story1.jpg' },
 *    { id: '2', title: 'Opening night', date: new Date('2026-03-29T19:30:00'), description: 'A sold-out opening night.', image: null }
 * ]
 */

import type { BlogView } from "@repo/common";
const { t } = useI18n()

interface Props {
  stories: BlogView[];
}
const props = defineProps<Props>();

const sortedStories = computed(() => // function to sort the stories, oldest first
    [...props.stories].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
);
</script>

<template>
  <div class="m-4">
    <!-- Title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      {{ t('production.stories') }}
    </h3>

    <div
        v-if="stories.length"
        class="flex flex-col gap-2"
    >
      <div v-if="stories.length" class="overflow-y-auto max-h-[35rem]">
        <div class="flex flex-col gap-2">
          <BlogsStoryListItem
              v-for="story in sortedStories"
              :key="story.id"
              :story="story"
              data-testid="data-story"
          />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
        v-else
        class="rounded-xl border border-border bg-card dark:bg-muted p-4 text-[12px] text-foreground/60"
    >
      {{ t('production.noStories') }}
    </div>
  </div>
</template>

<style scoped>

</style>
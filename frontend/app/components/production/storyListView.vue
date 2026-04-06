<script setup lang="ts">
/**
 * A reusable story list component, displays stories belonging to a specific production, includes:
 *  - Title, date and description displayed per story
 *  - Scrollable when there are more than 3 stories
 *
 * Usage:
 * <ProductionStories
 *    :stories="stories"
 * />
 *
 * Example stories:
 * const stories: BlogView[] = [
 *    { id: 1, titel: 'Rehearsal day 1', description: 'First rehearsal of the season.', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' },
 *    { id: 2, titel: 'Opening night', description: 'A sold-out opening night.', created_at: '2026-03-29T19:30:00Z', updated_at: '2026-03-29T19:30:00Z' }
 * ]
 */

import type { BlogView } from "@repo/common";
const { t } = useI18n()

interface Props {
  stories: BlogView[];
}
const props = defineProps<Props>();
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
      <div v-if="stories.length" class="overflow-y-auto max-h-[25rem]">
        <div class="flex flex-col gap-2">
          <BlogsStoryListItem
              v-for="story in stories"
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
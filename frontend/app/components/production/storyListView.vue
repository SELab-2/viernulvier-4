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

const stories: BlogView[] = [
  {
    id: 1,
    titel: 'DE MENS: REHEARSAL DIARIES',
    description: 'Een exclusieve blik achter de schermen tijdens de eerste repetitiedagen in de Theaterzaal.',
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z'
  },
  {
    id: 2,
    titel: 'DE GESCHIEDENIS VAN VIERNULVIER',
    description: 'Hoe deze productie kadert in de rijke historiek van ons kunstencentrum.',
    created_at: '2026-03-29T19:30:00Z',
    updated_at: '2026-03-29T19:30:00Z'
  }
]
</script>

<template>
  <div class="w-full">

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
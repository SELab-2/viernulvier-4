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

import { ref, computed } from "vue";
import type { BlogView } from "@repo/common";
import { ChevronDown, ChevronUp } from "lucide-vue-next";

const { t } = useI18n();

interface Props {
  stories: BlogView[];
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 3,
});

const isExpanded = ref(false);

const hasHiddenStories = computed(() => props.stories.length > props.limit);

const visibleStories = computed(() => {
  if (isExpanded.value) return props.stories;
  return props.stories.slice(0, props.limit);
});
</script>

<template>
  <div class="w-full">
    <div v-if="stories.length" class="flex flex-col items-center">
      <div class="flex flex-col gap-6 w-full transition-all duration-500">
        <BlogsStoryListItem
          v-for="story in visibleStories"
          :key="story.id"
          :story="story"
          data-testid="data-story"
        />
      </div>

      <button
        v-if="hasHiddenStories"
        @click="isExpanded = !isExpanded"
        class="mt-10 text-[11px] font-black uppercase tracking-[2px] text-accent hover:underline outline-none flex items-center gap-2"
      >
        <template v-if="!isExpanded">
          {{ t("general.showMore") }} ({{ stories.length - limit }})
          <ChevronDown :size="14" stroke-width="3" />
        </template>
        <template v-else>
          {{ t("general.showLess") }}
          <ChevronUp :size="14" stroke-width="3" />
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped></style>

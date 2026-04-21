<script setup lang="ts">
/**
 * A reusable story list component that displays stories belonging to a specific production.
 * * Features:
 * - Displays title, date, and description via BlogsStoryListItem.
 * - Limits visibility to a set number of items (default: 3).
 * - Includes a "Show More / Show Less" toggle button when the limit is exceeded.
 * - Each item is wrapped in a NuxtLink for easy navigation.
 *
 * Usage:
 * <ProductionStories
 * :stories="stories"
 * :limit="3"
 * />
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
      <div class="flex flex-col w-full space-y-2">
        <NuxtLink
          v-for="story in visibleStories"
          :key="story.id"
          :to="ROUTES.stories.byId(story.id)"
          class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg group"
          data-testid="data-story"
        >
          <BlogsStoryListItem :story="story" />
        </NuxtLink>
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

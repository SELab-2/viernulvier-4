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

import type {StoryItem} from "../../types/StoryItem";
const { t, locale } = useI18n()
import { CalendarDays } from "lucide-vue-next";

interface Props {
  stories: StoryItem[];
}
const props = defineProps<Props>();

// function to format the date
const formatDate = (date: Date) => {
  return date.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const sortedStories = computed(() => { // function to sort the stories, oldest first
  return [...props.stories].sort((a, b) => a.date.getTime() - b.date.getTime())
})

// constants
const cardBase = 'flex items-center gap-4 p-4 rounded-xl border border-border bg-card'
const cardHover = 'hover:border-ring hover:bg-card-hover hover:shadow-sm transition-colors transition-shadow duration-150 cursor-pointer'
const thumbnailClass = 'w-24 h-16 object-cover rounded-md shrink-0'
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
      <div class="overflow-y-auto max-h-[35rem]">
        <div class="flex flex-col gap-2">
          <div
              v-for="story in sortedStories"
              :key="story.id"
              data-testid="data-story"
              :class="[cardBase, cardHover]"
          > <!-- testid to make it easier for testing -->
            <!-- Thumbnail -->
            <img
                v-if="story.image"
                :src="story.image"
                :alt="story.title"
                :class="thumbnailClass"
            />
            <ThumbnailPlaceholder v-else :id="story.id" size="md" :showIcon="true" :showBorder="true" :rounded="true"/>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[13px] truncate">{{ story.title }}</p>
              <p class="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 mb-1.5">
                <CalendarDays :size="10" class="shrink-0" />
                {{ formatDate(story.date) }}
              </p>
              <p class="text-[11px] text-muted-foreground line-clamp-2 break-all">{{ story.description }}</p>
            </div>
          </div>
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
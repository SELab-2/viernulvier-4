<script setup lang="ts">
import type {StoryItem} from "../../types/StoryItem";
const { t, locale } = useI18n()
import { CalendarDays, MapPin, Euro, Clock } from "lucide-vue-next";

interface Props {
  stories: StoryItem[];
}
const props = defineProps<Props>();

const formatDate = (date: Date) => {
  return date.toLocaleDateString(locale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
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
              v-for="(story, index) in stories"
              :key="story.id"
              class="
              flex items-center gap-4 p-4
              rounded-xl border border-border bg-card dark:bg-muted
              hover:border-ring hover:shadow-sm transition-colors transition-shadow duration-150 cursor-pointer"
          >
            <!-- Thumbnail -->
            <img
                v-if="story.image"
                :src="story.image"
                :alt="story.title"
                class="w-24 h-16 object-cover rounded-md shrink-0"
            />
            <ThumbnailPlaceholder v-else :id="story.id" size="md" :showIcon="true" :showBorder="true" :rounded="true"/>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-[13px] truncate">{{ story.title }}</p>
              <p class="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 mb-1.5">
                <CalendarDays :size="10" class="shrink-0" />
                {{ formatDate(story.date) }}
              </p>
              <p class="text-[11px] text-muted-foreground line-clamp-2">{{ story.description }}</p>
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
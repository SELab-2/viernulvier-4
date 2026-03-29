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
    <!-- title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      {{ t('production.stories') }}
    </h3>

    <div
        v-if="stories.length"
        class="bg-muted border border-border rounded-lg overflow-hidden"
    >
      <div class="overflow-y-auto max-h-[24rem]">
        <div
            v-for="(article, index) in stories"
            :key="article.id"
            class="flex items-start gap-4 p-4 hover:bg-background/60 transition-colors cursor-pointer"
            :class="{ 'border-t border-border': index !== 0 }"
        >
          <!-- Thumbnail -->
          <img
              v-if="article.image"
              :src="article.image"
              :alt="article.title"
              class="w-24 h-16 object-cover rounded-md shrink-0"
          />
          <div
              v-else
              class="w-24 h-16 bg-border rounded-md shrink-0"
          />

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="font-bold text-[13px] truncate">{{ article.title }}</p>
            <p class="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 mb-1.5">
              <CalendarDays :size="10" class="shrink-0" />
              {{ formatDate(article.date) }}
            </p>
            <p class="text-[11px] text-muted-foreground line-clamp-2">{{ article.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
        v-else
        class="bg-muted border border-border rounded-lg p-4 text-[11px] text-muted-foreground"
    >
      {{ t('production.noStories') }}
    </div>
  </div>
</template>

<style scoped>

</style>
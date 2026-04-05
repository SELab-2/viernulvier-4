<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Toolbar row + in-flow calendar panel.

  The Calendar opens as a normal block element BELOW the toolbar row,
  so content underneath it is pushed down — no overlap, no z-index tricks.

  Props:
    sortOrder    — v-model "newest" | "oldest"
    storyTitles  — autocomplete list for SearchBar
    oldestDate   — ISO date of the oldest blog (fed into Calendar)
    dateFilter   — current active FilterBlog (controls active state of btn)

  Emits:
    update:sortOrder
    update:search
    update:dateFilter
-->
<script lang="ts" setup>
import type { FilterBlog } from "@repo/common";
import Calendar from "~/components/Calendar.vue";

const props = defineProps<{
  storyTitles: string[];
  oldestDate:  string;
  dateFilter:  FilterBlog;
}>();

const emit = defineEmits<{
  (e: "update:search",     query:  string):     void;
  (e: "update:dateFilter", filter: FilterBlog): void;
}>();

const sortOrder = defineModel<"newest" | "oldest">("sortOrder", { required: true });
const { t }     = useI18n();

const searchQuery   = ref("");
const calOpen       = ref(false);

const hasDateFilter = computed(() => !!(props.dateFilter.after || props.dateFilter.before));

watch(searchQuery, (val) => emit("update:search", val));
</script>

<template>
  <div class="border-b border-border bg-background">

    <!-- Toolbar row  -->
    <div class="container mx-auto px-4 max-w-5xl py-5 flex items-stretch gap-3">

      <!-- Search -->
      <div class="flex-1 min-w-0 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="storyTitles"
          :limit="6"
          :scroll-limit="4"
          :placeholder="t('stories.searchPlaceholder')"
        />
      </div>

      <!-- Date filter toggle -->
      <button
        :class="[
          'btn-outline h-10 gap-2 shrink-0',
          (calOpen || hasDateFilter) && '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
        ]"
        :aria-expanded="calOpen"
        :aria-label="t('stories.calendar.toggle')"
        @click="calOpen = !calOpen"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 1V3M8 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M1 5H11" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        <span v-if="hasDateFilter">{{ t("stories.calendar.filtered") }}</span>
        <span v-else>{{ t("stories.calendar.toggle") }}</span>
      </button>

      <!-- Sort -->
      <select
        v-model="sortOrder"
        class="h-10 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0 self-center"
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
      </select>

    </div>

    <!--Calendar panel — in flow, pushes content down -->
    <Transition name="cal-slide">
      <div v-if="calOpen" class="border-t border-border">
        <div class="container mx-auto px-4 max-w-5xl py-4">
          <Calendar
            :oldest-date="oldestDate"
            :model-filter="dateFilter"
            @update:filter="emit('update:dateFilter', $event)"
          />
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.cal-slide-enter-active,
.cal-slide-leave-active {
  transition: opacity 0.18s ease, max-height 0.22s ease;
  overflow: hidden;
  max-height: 600px;
}
.cal-slide-enter-from,
.cal-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
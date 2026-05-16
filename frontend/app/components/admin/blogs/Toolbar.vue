<!--
  components/admin/blogs/Toolbar.vue
  =====================================
  Search + filter-toggle + "New story" action bar for the admin blog list.

  Reuses StoryToolbar for search and filter toggling. Because StoryToolbar
  now accepts a `fetchSuggestions` prop, we can pass the blog-view composable's
  version without the toolbar knowing about the parent's composable choice.

  The "New story" button is injected via the `#action` slot of StoryToolbar
  so it lines up with the search bar at the same height.

  Props:
  - oldestDate      — passed through to StoryToolbar / filter panel
  - newestDate      — passed through to StoryToolbar / filter panel
  - dateFilter      — currently active DateFilter
  - hasDateFilter   — true when any date filter is active (shows clear badge)

  Emits:
  - update:search        — debounced search string
  - update:dateFilter    — new DateFilter
  - toggle-filter-panel  — user clicked the filter button
  - clear-filters        — user clicked the ×-badge
-->

<script setup lang="ts">
import type { DateFilter } from "~/types/DateFilter";
import type { SearchSuggestion } from "~/components/SearchBar.vue";

const { t } = useI18n();

const props = defineProps<{
  /** ISO date string: oldest blog — lower bound for the calendar. */
  oldestDate: string;
  /** ISO date string: newest blog — upper bound for the year picker. */
  newestDate: string;
  /** Currently active date filter. */
  dateFilter: DateFilter;
  /**
   * Custom autocomplete function forwarded to StoryToolbar.
   * Typically the one from useBlogView, but can be swapped for any entity type.
   */
  fetchSuggestions: (
    query: string,
    limit: number,
  ) => Promise<SearchSuggestion[]>;
}>();

const emit = defineEmits<{
  (e: "update:search", val: string): void;
  (e: "update:dateFilter", val: DateFilter): void;
}>();
</script>

<template>
  <!--
    StoryToolbar handles:
    - the search input (emits update:search)
    - the filter toggle button + ×-badge
    - the collapsible filter panel (year picker + calendar)

    We pass `no-container` because AdminBlogsListView already provides
    horizontal padding, and `dense` to reduce vertical whitespace inside cards.
  -->
  <BlogsStoryToolbar
    :story-titles="[]"
    :oldest-date="oldestDate"
    :newest-date="newestDate"
    :date-filter="dateFilter"
    :fetch-suggestions="fetchSuggestions"
    dense
    no-container
    @update:search="emit('update:search', $event)"
    @update:date-filter="emit('update:dateFilter', $event)"
  >
    <!-- "New story" button rendered flush-right at search-bar height -->
    <template #action>
      <NuxtLink
        :to="ROUTES.admin.stories.create"
        class="h-full inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-accent text-white font-brand font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all hover:opacity-80 shadow-md shadow-accent/30"
      >
        <svg
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 5v14m-7-7h14"
          />
        </svg>
        {{ t("admin.blogs.new") }}
      </NuxtLink>
    </template>
  </BlogsStoryToolbar>
</template>

<!--
ArchiveSearchSection.vue

Top control section for the archive page.
Responsible for:
- Passing search, sort, and date-filter state to StoryToolbar
- Rendering the tag filter inside StoryToolbar's #extra-filters slot
- Rendering the grid/list toggle inside StoryToolbar's #action slot (public only)
- Fetching the oldest/newest available date for the calendar and year slider

Uses:
- useArchiveView: shared archive state (filters, view mode, etc.)
- useProductionApi / useEventApi: to derive oldest available date
- StoryToolbar: reused search + sort + filter panel
- TagFilter: tag selection UI

Modes:
- Public:  search + filters + grid/list toggle
- Admin:   search + filters only, forced list view
-->
<script setup lang="ts">
import { LayoutGrid, List } from "lucide-vue-next";
import { useArchiveView } from "../../composables/useArchiveView";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import type { ProductionView, Event } from "@repo/common";
import TagFilter from "./TagFilter.vue";
import { getToday } from "~/utils/constants";

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean;
  }>(),
  {
    isAdmin: false,
  },
);

const { t, locale } = useI18n();

const {
  viewMode,
  searchQuery,
  sortOrder,
  dateFilter,
  oldestDate,
  newestDate,
  tagIds,
  fetchSuggestions,
} = useArchiveView();

const { getAll: getAllProductions } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();

// Show the ×-badge when tags are active or the date filter is custom (not the defaults)
const hasActiveFilters = computed(() => {
  return (
    tagIds.value.length > 0 ||
    !!dateFilter.value.after ||
    dateFilter.value.before !== getToday()
  );
});

async function fetchOldestDate() {
  try {
    const resp = await getAllProductions({
      paginationFilters: { page: 0, limit: 1, descending: false },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    const first = resp.data?.objects?.[0] as ProductionView | undefined;
    if (!first?.id) return;

    const evResp = await getAllEvents({
      eventFilters: { production_id: first.id as any },
    });

    const events: Event[] = Array.isArray((evResp.data as any)?.objects)
      ? (evResp.data as any).objects
      : Array.isArray(evResp.data)
        ? (evResp.data as any)
        : [];

    const times = events
      .flatMap((e) => [e.starttime, e.endtime])
      .filter(Boolean)
      .map((t) => Date.parse(t!))
      .filter((t) => !Number.isNaN(t));

    if (times.length) {
      oldestDate.value = new Date(Math.min(...times))
        .toISOString()
        .slice(0, 10);
    }
  } catch {
    // Non-critical: calendar and year slider still work without the oldest date
  }
}

onMounted(() => {
  if (props.isAdmin) {
    viewMode.value = "list";
  }

  fetchOldestDate();
});
</script>

<template>
  <!--
    StoryToolbar handles: search bar, sort select, filter toggle button, ×-badge,
    year range slider, calendar, and the collapsible filter panel transition.

    We supply:
    - #action slot: grid/list toggle (public mode only)
    - #extra-filters slot: TagFilter
    - extraFiltersActive: drives the ×-badge (includes tag activity)
    - @clear-filters: clears the tag selection when the badge is clicked
  -->
  <BlogsStoryToolbar
    v-model:sort-order="sortOrder"
    :story-titles="[]"
    :oldest-date="oldestDate"
    :newest-date="newestDate"
    :date-filter="dateFilter"
    :fetch-suggestions="fetchSuggestions"
    :extra-filters-active="hasActiveFilters"
    :sort-label="t('archive.sortLabel')"
    @update:search="searchQuery = $event"
    @update:date-filter="dateFilter = $event"
    @clear-filters="tagIds = []"
  >
    <!-- Grid/list toggle (public mode only) -->
    <template v-if="!isAdmin" #action>
      <button
        class="w-12 h-12 flex items-center justify-center rounded-md border-2 border-[var(--foreground)] bg-transparent text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--background)]"
        @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
      >
        <List v-if="viewMode === 'grid'" class="w-4 h-4" />
        <LayoutGrid v-else class="w-4 h-4" />
      </button>
    </template>

    <!-- Tag filter rendered at the bottom of the filter panel -->
    <template #extra-filters>
      <div class="flex flex-col gap-2">
        <span
          class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          {{ t("archive.tagsLabel") }}
        </span>
        <TagFilter />
      </div>
    </template>
  </BlogsStoryToolbar>
</template>

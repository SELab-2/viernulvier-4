<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Sticky toolbar rendered above the stories list. Provides:

  - Full-text search via SearchBar. Emits `update:search` on change.
  - A collapsible filter panel containing:
      • Sort-order select (styled like the filter button — bordered, inverts on hover).
      • Year range slider (YearRangeSlider). Dragging either handle sets a full-year
        date range; resetting both handles to the full span clears the filter.
      • Arbitrary date-range picker (DefaultCalendar). When the calendar emits a range
        the year slider resets to full span, and vice-versa.
  - A small ×-badge on the filter button when a date filter (or extra filter) is active
    but the panel is closed, allowing one-click reset without reopening the panel.
  - An optional #action slot rendered flush-right in the toolbar row.
  - An optional #extra-filters slot rendered at the bottom of the filter panel, for
    additional filters that don't belong to StoryToolbar itself (e.g. tag filter in
    the archive).

  Props:
  - storyTitles:          legacy prop, kept for backwards compat (unused internally).
  - oldestDate:           ISO date string — lower bound for the calendar / year slider.
  - newestDate:           ISO date string — upper bound for the year slider.
  - dateFilter:           the currently active DateFilter (controlled from parent).
  - dense:                when true the toolbar uses slightly less vertical padding.
  - noContainer:          when true the inner row uses full width (no page-container).
  - fetchSuggestions:     optional async function for autocomplete results.
  - sortOrder:            optional controlled sort order (falls back to useBlogView).
  - searchQuery:          optional controlled search query (for archive reuse).
  - extraFiltersActive:   when true, shows the ×-badge even without a date filter.
                          When provided, overrides the default hasDateFilter check.
  - sortLabel:            accessible label for the sort select (sr-only).

  Emits:
  - update:search         — debounced search string
  - update:dateFilter     — DateFilter object (after/before ISO strings or empty)
  - update:sortOrder      — sort order change (only when sortOrder prop is provided)
  - clear-filters         — fired when the ×-badge is clicked (archive can use this
                            to also clear its tag filter)
-->

<script lang="ts" setup>
import { useBlogView } from "~/composables/blogs/useBlogView";
import type { DateFilter } from "~/types/DateFilter";
import type { SearchSuggestion } from "~/components/SearchBar.vue";
import { isoYear } from "~/utils/formatters";

const { t } = useI18n();

const blogView = useBlogView();

const props = defineProps<{
  /** Kept for backwards compatibility — not used internally. */
  storyTitles: string[];
  /** ISO date string: oldest story date, passed to DefaultCalendar / YearRangeSlider. */
  oldestDate: string;
  /** ISO date string: newest story date, used by YearRangeSlider to build the year range. */
  newestDate: string;
  /** Currently active date filter (controlled from the parent). */
  dateFilter: DateFilter;
  /** Reduce vertical padding for denser layouts (e.g. inside admin cards). */
  dense?: boolean;
  /**
   * Skip the page-container class so the toolbar row spans the full width.
   * Use this when the parent already provides horizontal padding.
   */
  noContainer?: boolean;
  /**
   * Custom autocomplete function. Defaults to the blog-view implementation.
   */
  fetchSuggestions?: (
    query: string,
    limit: number,
  ) => Promise<SearchSuggestion[]>;
  /**
   * Optional controlled sort order. When provided, the toolbar emits
   * `update:sortOrder` instead of mutating useBlogView directly.
   * Falls back to useBlogView.sortOrder when omitted.
   */
  sortOrder?: "newest" | "oldest";
  /**
   * Optional controlled search query (for reuse outside the blog context).
   * When provided, the SearchBar shows this value and emits changes via
   * `update:search` without touching useBlogView.searchQuery.
   */
  searchQuery?: string;
  /**
   * When provided, this value controls whether the ×-badge is shown instead
   * of the default `hasDateFilter` check. Pass `true` when the parent has
   * additional active filters (e.g. tags in the archive).
   */
  extraFiltersActive?: boolean;
  /** Accessible label for the sort <select>. */
  sortLabel?: string;
}>();

const emit = defineEmits<{
  "update:search": [query: string];
  "update:dateFilter": [filter: DateFilter];
  "update:sortOrder": [val: "newest" | "oldest"];
  /** Fired when the ×-badge is clicked so the parent can clear its own filters. */
  "clear-filters": [];
}>();

// ——— Sort order ———
// Controlled via prop when provided; falls back to the shared blogView ref.
const activeSortOrder = computed({
  get: () => props.sortOrder ?? blogView.sortOrder.value,
  set: (val: "newest" | "oldest") => {
    emit("update:sortOrder", val);
    if (props.sortOrder === undefined) {
      blogView.sortOrder.value = val;
    }
  },
});

// ——— Search query ———
// Local ref that either stays in sync with the prop (archive/controlled mode) or
// with useBlogView.searchQuery (blog/admin mode — backward compat).
const localSearch = ref(
  props.searchQuery !== undefined
    ? props.searchQuery
    : blogView.searchQuery.value,
);

watch(
  () => props.searchQuery,
  (v) => {
    if (v !== undefined && v !== localSearch.value) localSearch.value = v;
  },
);

watch(localSearch, (val) => {
  emit("update:search", val);
  if (props.searchQuery === undefined) {
    blogView.searchQuery.value = val;
  }
});

// ——— Suggestions ———
const resolvedFetchSuggestions = computed(
  () => props.fetchSuggestions ?? blogView.fetchSuggestions,
);

// ——— Filter panel ———
const panelOpen = ref(false);
const calendarKey = ref(0);

// Guard: prevent the calendar's re-mount emission from overwriting the year filter.
const skipNextCalendarEmit = ref(false);

// ——— Year range slider ———
const oldestYear = computed(() => {
  const y = isoYear(props.oldestDate);
  return !isNaN(y) && y > 0 ? y : new Date().getFullYear() - 10;
});
const newestYear = computed(() => {
  const y = isoYear(props.newestDate);
  return !isNaN(y) && y > 0 ? y : new Date().getFullYear();
});

const yearRange = ref<[number, number]>([oldestYear.value, newestYear.value]);

// Initialise / reset the slider when the year bounds are loaded asynchronously.
// Only resets if the slider was still at the previous full range (user hasn't moved it).
watch([oldestYear, newestYear], ([o, n], [prevO, prevN]) => {
  const [from, to] = yearRange.value;
  if (from === prevO && to === prevN) {
    yearRange.value = [o, n];
  }
});

function onYearRangeUpdate([from, to]: [number, number]) {
  yearRange.value = [from, to];
  const isFullRange = from === oldestYear.value && to === newestYear.value;
  if (isFullRange) {
    emit("update:dateFilter", {});
  } else {
    skipNextCalendarEmit.value = true;
    emit("update:dateFilter", {
      after: `${from}-01-01`,
      before: `${to}-12-31`,
    });
    calendarKey.value++;
  }
}

// Calendar
function onCalendarFilter(filter: DateFilter) {
  if (skipNextCalendarEmit.value) {
    skipNextCalendarEmit.value = false;
    return;
  }
  // Calendar used → reset year slider to full span (the two controls are mutually exclusive)
  yearRange.value = [oldestYear.value, newestYear.value];
  emit("update:dateFilter", filter);
}

function clearAllFilters() {
  yearRange.value = [oldestYear.value, newestYear.value];
  skipNextCalendarEmit.value = true;
  calendarKey.value++;
  emit("update:dateFilter", {});
  emit("clear-filters");
}

// Keep yearRange in sync when the parent clears or changes dateFilter externally.
watch(
  () => props.dateFilter,
  (f) => {
    if (!f.after && !f.before) {
      yearRange.value = [oldestYear.value, newestYear.value];
      return;
    }
    if (f.after?.endsWith("-01-01") && f.before?.endsWith("-12-31")) {
      const from = parseInt(f.after.substring(0, 4));
      const to = parseInt(f.before.substring(0, 4));
      if (!isNaN(from) && !isNaN(to)) {
        yearRange.value = [from, to];
      }
    } else if (!f.after) {
      // Only a `before` bound (e.g. the archive default) → no year range filter
      yearRange.value = [oldestYear.value, newestYear.value];
    }
  },
  { deep: true },
);

// ——— Derived UI state ———

/** True when any date filter is currently active. */
const hasDateFilter = computed(
  () => !!(props.dateFilter.after || props.dateFilter.before),
);

/**
 * Whether to show the ×-badge.
 * If `extraFiltersActive` is explicitly provided, use it as the sole source of truth
 * (the parent knows about all active filters including non-date ones like tags).
 * Otherwise fall back to hasDateFilter.
 */
const hasBadge = computed(() =>
  props.extraFiltersActive !== undefined
    ? props.extraFiltersActive
    : hasDateFilter.value,
);

/** Height class applied to interactive controls so they line up. */
const rowHeight = computed(() => (props.dense ? "h-11" : "h-12"));
</script>

<template>
  <div class="w-full border-b border-border bg-background">
    <!-- Toolbar row -->
    <div
      :class="[
        'flex items-center gap-3',
        props.dense ? 'py-4' : 'py-5',
        props.noContainer ? 'w-full' : 'page-container',
      ]"
    >
      <!-- Search input -->
      <div :class="['flex-1 min-w-0', rowHeight]">
        <SearchBar
          v-model="localSearch"
          :fetch-suggestions="resolvedFetchSuggestions"
          :limit="15"
          :scroll-limit="5"
          :placeholder="t('stories.searchPlaceholder')"
          class="h-full"
        />
      </div>

      <!-- Sort order toggle button — same visual style as the filter button -->
      <button
        type="button"
        :class="['btn-outline shrink-0', rowHeight]"
        :aria-label="
          activeSortOrder === 'newest'
            ? t('stories.sortNewest')
            : t('stories.sortOldest')
        "
        :title="
          activeSortOrder === 'newest'
            ? t('stories.sortNewest')
            : t('stories.sortOldest')
        "
        @click="
          activeSortOrder = activeSortOrder === 'newest' ? 'oldest' : 'newest'
        "
      >
        <!-- Newest first: bars wide→narrow + down arrow -->
        <svg
          v-if="activeSortOrder === 'newest'"
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="2" x2="9" y2="2" />
          <line x1="1" y1="6" x2="6.5" y2="6" />
          <line x1="1" y1="10" x2="4" y2="10" />
          <line x1="13" y1="1" x2="13" y2="13" />
          <polyline points="10.5,10.5 13,13 15.5,10.5" />
        </svg>
        <!-- Oldest first: bars narrow→wide + up arrow -->
        <svg
          v-else
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="2" x2="4" y2="2" />
          <line x1="1" y1="6" x2="6.5" y2="6" />
          <line x1="1" y1="10" x2="9" y2="10" />
          <line x1="13" y1="13" x2="13" y2="1" />
          <polyline points="10.5,3.5 13,1 15.5,3.5" />
        </svg>
      </button>

      <!-- Filters toggle button with active-filter badge -->
      <div class="relative shrink-0">
        <button
          type="button"
          :class="[
            'btn-outline gap-2 shrink-0',
            rowHeight,
            panelOpen &&
              '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
          ]"
          :aria-expanded="panelOpen"
          :aria-label="t('general.filters')"
          @click="panelOpen = !panelOpen"
        >
          <!-- Funnel icon -->
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 2h10L7 6.5V10.5L5 9.5V6.5L1 2z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t("general.filters") }}</span>
        </button>

        <!-- ×-badge: one-click clear without opening the panel -->
        <button
          v-if="hasBadge"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
          :aria-label="t('stories.filters.clear')"
          @click.stop="clearAllFilters"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l6 6M7 1L1 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!--
        Action slot — rendered at the same height as the search bar.
        Example: grid/list toggle in the archive toolbar.
      -->
      <div v-if="$slots.action" class="shrink-0" :class="rowHeight">
        <slot name="action" />
      </div>
    </div>

    <!-- Collapsible filter panel -->
    <Transition name="cal-slide">
      <div v-if="panelOpen" class="border-t border-border">
        <div class="page-container py-6 flex flex-col gap-6">
          <!-- Year range slider — only shown when date bounds are available -->
          <div v-if="oldestDate && newestDate" class="flex flex-col gap-2">
            <span class="section-label">{{ t("stories.filters.year") }}</span>
            <YearRangeSlider
              :model-value="yearRange"
              :oldest-year="oldestYear"
              :newest-year="newestYear"
              @update:model-value="onYearRangeUpdate"
            />
          </div>

          <!-- Calendar date-range picker -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{
              t("stories.filters.dateRange")
            }}</span>
            <!--
              :key="calendarKey" forces a full re-mount whenever the year range
              slider changes so DefaultCalendar resets its own internal state.
            -->
            <DefaultCalendar
              :key="calendarKey"
              :oldest-date="oldestDate"
              :model-filter="dateFilter"
              @update:filter="onCalendarFilter"
            />
          </div>

          <!-- Extra filters slot (e.g. TagFilter in the archive) -->
          <slot name="extra-filters" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Slide + fade transition for the filter panel */
.cal-slide-enter-active,
.cal-slide-leave-active {
  transition:
    opacity 0.18s ease,
    max-height 0.25s ease;
  overflow: hidden;
  max-height: 900px;
}
.cal-slide-enter-from,
.cal-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.section-label {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}
</style>

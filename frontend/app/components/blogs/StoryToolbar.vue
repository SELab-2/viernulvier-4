<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Sticky toolbar rendered above the stories list. Provides:

  - Full-text search via SearchBar. Emits `update:search` on change.
  - A collapsible filter panel containing:
      • Sort-order select (newest / oldest), bound via the shared `sortOrder`
        ref from useBlogView.
      • Year picker (YearPicker). Selecting a year emits a full-year date
        range; deselecting clears the filter.
      • Arbitrary date-range picker (DefaultCalendar). When the calendar
        emits a range the active year pill is cleared, and vice-versa.
  - A small ×-badge on the filter button when a date filter is active but the
    panel is closed, allowing one-click reset without reopening the panel.
  - An optional #action slot rendered flush-right in the toolbar row,
    aligned to the same height as the search bar.

  Props:
  - storyTitles:      legacy prop, kept for backwards compat (unused internally).
  - oldestDate:       ISO date string — lower bound for the calendar.
  - newestDate:       ISO date string — upper bound for the year picker.
  - dateFilter:       the currently active DateFilter (controlled from parent).
  - dense:            when true the toolbar uses slightly less vertical padding.
  - noContainer:      when true the inner row uses full width (no page-container
                      padding/max-width). Set this when the component is already
                      inside a page layout that handles its own padding (e.g. admin).
  - fetchSuggestions: optional async function for autocomplete results.
                      Defaults to the one from useBlogView so the public page
                      works without passing the prop explicitly. Pass a custom
                      function from a different composable (e.g. usePrintView)
                      to reuse this toolbar in other contexts without coupling.

  Emits:
  - update:search      — debounced search string
  - update:dateFilter  — DateFilter object (after/before ISO strings or empty)
-->

<script lang="ts" setup>
import { useBlogView } from "~/composables/blogs/useBlogView";
import type { DateFilter } from "~/types/DateFilter";
import type { SearchSuggestion } from "~/components/SearchBar.vue";

const { t } = useI18n();

// Pull shared filter state (sortOrder, searchQuery) from the blog view store.
// These are module-level refs so changes here are reflected everywhere the
// composable is used (public page, admin list, etc.).
const {
  sortOrder,
  searchQuery,
  fetchSuggestions: defaultFetchSuggestions,
} = useBlogView();

const props = defineProps<{
  /** Kept for backwards compatibility — not used internally. */
  storyTitles: string[];
  /** ISO date string: oldest story date, passed to DefaultCalendar. */
  oldestDate: string;
  /** ISO date string: newest story date, used by YearPicker to build the year list. */
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
   * Pass a different function to reuse this toolbar for other entity types
   * (e.g. prints, productions) without coupling to useBlogView.
   */
  fetchSuggestions?: (
    query: string,
    limit: number,
  ) => Promise<SearchSuggestion[]>;
}>();

const emit = defineEmits<{
  (e: "update:search", query: string): void;
  (e: "update:dateFilter", filter: DateFilter): void;
}>();

// Use the prop if provided, otherwise fall back to the blog-view default.
const resolvedFetchSuggestions = computed(
  () => props.fetchSuggestions ?? defaultFetchSuggestions,
);

// Filter panel state

const panelOpen = ref(false);

/** Currently selected year pill (null = none selected). */
const selectedYear = ref<number | null>(null);

/**
 * Key that is bumped whenever we want DefaultCalendar to fully re-mount
 * and reset its internal state (e.g. after a year pill click clears the range).
 */
const calendarKey = ref(0);

/**
 * Guard flag: when we update the calendar key after a year-pill click the
 * calendar will emit an empty filter on mount. We skip that one emission so
 * the year-based filter is not immediately cleared.
 */
const skipNextCalendarEmit = ref(false);

// Forward search string to parent whenever it changes.
watch(searchQuery, (val) => emit("update:search", val));

// Year picker

/**
 * Called by YearPicker when a year pill is clicked or cleared.
 * - Selecting a year: emit a full-year date range and reset the calendar.
 * - Clearing (year = null): emit an empty filter and reset the calendar.
 */
function onYearUpdate(year: number | null) {
  if (year === null) {
    selectedYear.value = null;
    calendarKey.value++;
    emit("update:dateFilter", {});
  } else {
    selectedYear.value = year;
    // Prevent the calendar's mount-emit from overwriting our year filter.
    skipNextCalendarEmit.value = true;
    emit("update:dateFilter", {
      after: `${year}-01-01`,
      before: `${year}-12-31`,
    });
    calendarKey.value++;
  }
}

// Calendar

/**
 * Called by DefaultCalendar whenever its internal selection changes.
 * Clears the active year pill so the two controls don't conflict.
 */
function onCalendarFilter(filter: DateFilter) {
  // Skip the emission that is triggered by the calendar re-mounting after a
  // year-pill click (see skipNextCalendarEmit above).
  if (skipNextCalendarEmit.value) {
    skipNextCalendarEmit.value = false;
    return;
  }
  selectedYear.value = null;
  emit("update:dateFilter", filter);
}

/** Clear all date-based filters and reset both picker controls. */
function clearAllFilters() {
  selectedYear.value = null;
  calendarKey.value++;
  emit("update:dateFilter", {});
}

// Keep `selectedYear` in sync when the parent clears or sets a date filter
// from the outside (e.g. resetting all filters from ArchiveSearchSection).
watch(
  () => props.dateFilter,
  (f) => {
    if (!f.after && !f.before) {
      selectedYear.value = null;
      return;
    }
    // Detect a full-year filter set via the year picker and reflect it back.
    const isFullYear =
      f.after?.endsWith("-01-01") &&
      f.before?.endsWith("-12-31") &&
      f.after.substring(0, 4) === f.before.substring(0, 4);
    if (!isFullYear) {
      selectedYear.value = null;
    }
  },
  { deep: true },
);

// Derived UI state

/** True when any date filter is currently active. */
const hasDateFilter = computed(
  () => !!(props.dateFilter.after || props.dateFilter.before),
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
          v-model="searchQuery"
          :fetch-suggestions="resolvedFetchSuggestions"
          :limit="15"
          :scroll-limit="5"
          :placeholder="t('stories.searchPlaceholder')"
          class="h-full"
        />
      </div>

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
          v-if="hasDateFilter"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
          @click.stop="clearAllFilters"
          :aria-label="t('stories.filters.clear')"
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
        Example: "New story" button in the admin toolbar.
      -->
      <div v-if="$slots.action" class="shrink-0" :class="rowHeight">
        <slot name="action" />
      </div>
    </div>

    <!-- Collapsible filter panel -->
    <Transition name="cal-slide">
      <div v-if="panelOpen" class="border-t border-border">
        <div class="container mx-auto px-4 max-w-5xl py-6 flex flex-col gap-6">
          <!-- Sort order -->
          <div class="flex flex-col gap-2 w-max">
            <span class="section-label">{{ t("stories.sortLabel") }}</span>
            <select
              v-model="sortOrder"
              class="h-10 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 w-max"
            >
              <option value="newest">{{ t("stories.sortNewest") }}</option>
              <option value="oldest">{{ t("stories.sortOldest") }}</option>
            </select>
          </div>

          <!-- Year picker — only shown when date bounds are available -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{ t("stories.filters.year") }}</span>
            <YearPicker
              :model-value="selectedYear"
              :oldest-date="oldestDate"
              :newest-date="newestDate"
              @update:model-value="onYearUpdate"
            />
          </div>

          <!-- Calendar date-range picker -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{
              t("stories.filters.dateRange")
            }}</span>
            <!--
              :key="calendarKey" forces a full re-mount whenever the year picker
              changes so DefaultCalendar resets its own internal state.
            -->
            <DefaultCalendar
              :key="calendarKey"
              :oldest-date="oldestDate"
              :model-filter="dateFilter"
              @update:filter="onCalendarFilter"
            />
          </div>
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

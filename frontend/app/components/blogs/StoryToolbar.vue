<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Sticky toolbar rendered above the stories list. Provides:

  - Full-text search (delegates to SearchBar, emits `update:search`).
  - A collapsible filter panel containing:
      • Sort-order select (newest / oldest), bound via `sortOrder` v-model.
      • Year picker (delegates to YearPicker). Selecting a year emits a
        full-year date range; deselecting clears the filter.
      • Arbitrary date-range picker (DefaultCalendar). When the calendar
        emits a range we clear any active year pill, and vice-versa.
  - A small ×-badge on the filter button when a date filter is active but the
    panel is closed, allowing one-click reset without reopening the panel.

  The calendar is remounted (via `calendarKey`) whenever a year pill is
  toggled so its internal range state stays in sync. A `skipNextCalendarEmit`
  flag swallows the synthetic `update:filter` that DefaultCalendar fires on
  mount, preventing it from immediately wiping the year we just set.
-->

<script lang="ts" setup>
import { useBlogView } from "~/composables/blogs/useBlogView";
import type { DateFilter } from "~/types/DateFilter";

const { t } = useI18n();
const { sortOrder, searchQuery, dateFilter, fetchSuggestions } = useBlogView();

const props = defineProps<{
  storyTitles: string[];
  oldestDate: string;
  newestDate: string;
  dateFilter: DateFilter;
}>();

const emit = defineEmits<{
  (e: "update:search", query: string): void;
  (e: "update:dateFilter", filter: DateFilter): void;
}>();

const panelOpen = ref(false);
const selectedYear = ref<number | null>(null);
const calendarKey = ref(0);

// When we remount the calendar via calendarKey++, DefaultCalendar fires an
// initial @update:filter({}) on mount. This flag lets onCalendarFilter know
// to ignore that one synthetic emit so it doesn't wipe selectedYear.
const skipNextCalendarEmit = ref(false);

watch(searchQuery, (val) => emit("update:search", val));

function onYearUpdate(year: number | null) {
  if (year === null) {
    // Deselect — full reset; calendar emit on remount is fine (filter is empty)
    selectedYear.value = null;
    calendarKey.value++;
    emit("update:dateFilter", {});
  } else {
    // Select — remount calendar to clear its internal range state, but
    // suppress the resulting mount-emit so it doesn't clear selectedYear.
    selectedYear.value = year;
    skipNextCalendarEmit.value = true;
    emit("update:dateFilter", {
      after: `${year}-01-01`,
      before: `${year}-12-31`,
    });
    calendarKey.value++;
  }
}

function onCalendarFilter(filter: DateFilter) {
  // Swallow the one synthetic emit that fires when the calendar remounts
  if (skipNextCalendarEmit.value) {
    skipNextCalendarEmit.value = false;
    return;
  }
  selectedYear.value = null;
  emit("update:dateFilter", filter);
}

function clearAllFilters() {
  selectedYear.value = null;
  calendarKey.value++;
  emit("update:dateFilter", {});
}

watch(
  () => props.dateFilter,
  (f) => {
    if (!f.after && !f.before) {
      selectedYear.value = null;
      return;
    }
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

// Active state
const hasDateFilter = computed(
  () => !!(props.dateFilter.after || props.dateFilter.before),
);
const filterIsActive = computed(() => panelOpen.value || hasDateFilter.value);
</script>

<template>
  <div class="w-full border-b border-border bg-background">
    <!-- Toolbar row -->
    <div class="page-container py-5 flex items-stretch gap-3">
      <!-- Search -->
      <div class="flex-1 min-w-0 h-12">
        <SearchBar
          v-model="searchQuery"
          :fetch-suggestions="fetchSuggestions"
          :limit="15"
          :scroll-limit="5"
          :placeholder="t('stories.searchPlaceholder')"
        />
      </div>

      <!-- Filters toggle -->
      <div class="relative">
        <button
          type="button"
          :class="[
            'btn-outline h-12 gap-2 shrink-0',
            panelOpen &&
              '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
          ]"
          :aria-expanded="panelOpen"
          :aria-label="t('general.filters')"
          @click="panelOpen = !panelOpen"
        >
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

        <!-- Clear badge — visible when filter active -->
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
    </div>

    <!-- Filter panel — vertical layout -->
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

          <!-- Year picker -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{ t("stories.filters.year") }}</span>
            <YearPicker
              :model-value="selectedYear"
              :oldest-date="oldestDate"
              :newest-date="newestDate"
              @update:model-value="onYearUpdate"
            />
          </div>

          <!-- Calendar -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{
              t("stories.filters.dateRange")
            }}</span>
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

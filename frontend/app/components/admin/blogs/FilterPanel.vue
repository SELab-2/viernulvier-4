<!--
  components/admin/blogs/FilterPanel.vue
  ========================================
  Collapsible filter panel used in the admin blog list.

  Renders:
  - Sort-order select (newest / oldest)
  - Year picker (YearPicker)
  - Calendar date-range picker (DefaultCalendar)

  This component is purely presentational — all state lives in the parent
  (AdminBlogsListView) which passes it down via props and receives changes
  through events. That keeps the parent in control and makes this panel
  straightforward to test in isolation.

  Props:
  - open          — whether the panel is currently visible
  - sortOrder     — v-model for the sort direction
  - selectedYear  — which year pill is active (null = none)
  - calendarKey   — bump to force DefaultCalendar to re-mount and reset
  - dateFilter    — the currently active DateFilter
  - oldestDate    — lower date bound for the calendar
  - newestDate    — upper date bound for the year picker

  Emits:
  - update:sortOrder    — new sort direction
  - update:selectedYear — new year (or null)
  - update:calendarKey  — incremented key after a year change
  - calendar-filter     — DateFilter from DefaultCalendar
  - clear               — user clicked "clear all"
-->

<script setup lang="ts">
import type { DateFilter } from "~/types/DateFilter";

const { t } = useI18n();

const props = defineProps<{
  /** Whether the panel is visible. */
  open: boolean;
  /** Current sort direction. */
  sortOrder: "newest" | "oldest";
  /** Active year pill, or null. */
  selectedYear: number | null;
  /**
   * Key passed to DefaultCalendar. Bump this to force a full re-mount
   * (e.g. after a year-pill click so the calendar resets its state).
   */
  calendarKey: number;
  /** Currently active date filter. */
  dateFilter: DateFilter;
  /** ISO date string: earliest available blog date. */
  oldestDate: string;
  /** ISO date string: most recent blog date. */
  newestDate: string;
}>();

const emit = defineEmits<{
  (e: "update:sortOrder", val: "newest" | "oldest"): void;
  (e: "update:selectedYear", val: number | null): void;
  (e: "calendar-filter", val: DateFilter): void;
  (e: "clear"): void;
}>();

/**
 * Year-pill handler: forward the selection up to the parent which will
 * also reset the calendar key and emit the date-filter update.
 */
function onYearUpdate(year: number | null) {
  emit("update:selectedYear", year);
}

/**
 * Calendar handler: forward the emitted filter to the parent.
 * The parent decides whether to guard against the calendar's mount-emit.
 */
function onCalendarFilter(filter: DateFilter) {
  emit("calendar-filter", filter);
}
</script>

<template>
  <!--
    Transition wraps the panel so it slides in/out smoothly.
    The parent controls visibility via the `open` prop.
  -->
  <Transition name="cal-slide">
    <div
      v-if="open"
      class="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div class="p-6 flex flex-col gap-6">
        <!-- Sort order -->
        <div class="flex flex-col gap-2 w-max">
          <span class="section-label">{{ t("stories.sortLabel") }}</span>
          <select
            :value="sortOrder"
            @change="
              emit(
                'update:sortOrder',
                ($event.target as HTMLSelectElement).value as
                  | 'newest'
                  | 'oldest',
              )
            "
            class="h-10 px-3 rounded-lg bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer hover:border-foreground/30 transition-colors w-max"
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

        <!-- Calendar date-range picker -->
        <div class="flex flex-col gap-2">
          <span class="section-label">{{
            t("stories.filters.dateRange")
          }}</span>
          <!--
            :key="calendarKey" ensures DefaultCalendar re-mounts (and resets)
            whenever the parent bumps the key after a year-pill click.
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
  font-family: var(--font-brand, sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}
</style>

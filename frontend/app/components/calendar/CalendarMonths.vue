<!--
  components/calendar/CalendarMonths.vue
  ========================================
  Renders the two visible month grids side-by-side with prev/next arrows.
  All selection logic stays in the parent; only display + navigation here.
-->
<script lang="ts" setup>
import CalendarGrid from "./CalendarGrid.vue";

export interface MonthData {
  label: string;
  days:  Array<{ iso: string; day: number } | null>;
}

defineProps<{
  leftMonth:    MonthData;
  rightMonth:   MonthData;
  weekdays:     string[];
  isSelected:   (iso: string) => boolean;
  isRangeStart: (iso: string) => boolean;
  isRangeEnd:   (iso: string) => boolean;
  isInRange:    (iso: string) => boolean;
  isToday:      (iso: string) => boolean;
  isFuture:     (iso: string) => boolean;
  isRangeCapLeft: (iso: string) => boolean;
  prevLabel:    string;
  nextLabel:    string;
}>();

const emit = defineEmits<{
  (e: "click-day", iso: string): void;
  (e: "hover-day", iso: string): void;
  (e: "leave-day"             ): void;
  (e: "prev"                  ): void;
  (e: "next"                  ): void;
}>();
</script>

<template>
  <div class="cal-months">
    <!-- Prev arrow -->
    <button class="cal-nav cal-nav--prev" :aria-label="prevLabel" @click="emit('prev')">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Left month -->
    <CalendarGrid
      :label="leftMonth.label"
      :days="leftMonth.days"
      :weekdays="weekdays"
      :is-selected="isSelected"
      :is-range-start="isRangeStart"
      :is-range-end="isRangeEnd"
      :is-in-range="isInRange"
      :is-today="isToday"
      :is-future="isFuture"
      :is-range-cap-left="isRangeCapLeft"
      @click-day="(iso) => emit('click-day', iso)"
      @hover-day="(iso) => emit('hover-day', iso)"
      @leave-day="emit('leave-day')"
    />

    <!-- Right month -->
    <CalendarGrid
      class="cal-month--right"
      :label="rightMonth.label"
      :days="rightMonth.days"
      :weekdays="weekdays"
      :is-selected="isSelected"
      :is-range-start="isRangeStart"
      :is-range-end="isRangeEnd"
      :is-in-range="isInRange"
      :is-today="isToday"
      :is-future="isFuture"
      :is-range-cap-left="isRangeCapLeft"
      @click-day="(iso) => emit('click-day', iso)"
      @hover-day="(iso) => emit('hover-day', iso)"
      @leave-day="emit('leave-day')"
    />

    <!-- Next arrow -->
    <button class="cal-nav cal-nav--next" :aria-label="nextLabel" @click="emit('next')">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5 2L10 7L5 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>
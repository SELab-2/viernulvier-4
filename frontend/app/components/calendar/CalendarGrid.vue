<!--
  components/calendar/CalendarGrid.vue
  =====================================
  Pure presentational component.
  Renders one month: label, weekday headers, and the day grid.
  All selection logic lives in the parent (Calendar.vue).
-->
<script lang="ts" setup>
defineProps<{
  label:    string;
  days:     Array<{ iso: string; day: number } | null>;
  weekdays: string[];
  // Day-state classifiers passed from parent
  isSelected:     (iso: string) => boolean;
  isRangeStart:   (iso: string) => boolean;
  isRangeEnd:     (iso: string) => boolean;
  isInRange:      (iso: string) => boolean;
  isToday:        (iso: string) => boolean;
  isFuture:       (iso: string) => boolean;
  isRangeCapLeft: (iso: string) => boolean; 
}>();

const emit = defineEmits<{
  (e: "click-day",  iso: string): void;
  (e: "hover-day",  iso: string): void;
  (e: "leave-day"              ): void;
}>();
</script>

<template>
  <div class="cal-month">
    <div class="cal-month-label">{{ label }}</div>

    <div class="cal-weekdays">
      <span v-for="wd in weekdays" :key="wd" class="cal-wd">{{ wd }}</span>
    </div>

    <div class="cal-grid">
      <template v-for="(cell, i) in days" :key="i">
        <span v-if="!cell" class="cal-cell cal-cell--empty" />
        <button
          v-else
          :class="[
            'cal-cell',
            'cal-cell--day',
            {
              'cal-cell--today':          isToday(cell.iso),
              'cal-cell--selected':       isSelected(cell.iso),
              'cal-cell--in-range':       isInRange(cell.iso),
              'cal-cell--range-start':    isRangeStart(cell.iso),
              'cal-cell--range-end':      isRangeEnd(cell.iso),
              'cal-cell--future':         isFuture(cell.iso),
              'cal-cell--range-cap-left': isRangeCapLeft(cell.iso),
            },
          ]"
          :disabled="isFuture(cell.iso)"
          :aria-label="cell.iso"
          @click="emit('click-day', cell.iso)"
          @mouseenter="emit('hover-day', cell.iso)"
          @mouseleave="emit('leave-day')"
        >
          {{ cell.day }}
        </button>
      </template>
    </div>
  </div>
</template>
<!--
  components/calendar/CalendarFooter.vue
  ========================================
  Displays the current selection summary and a clear button.
  Purely presentational — receives computed strings from parent.
-->
<script lang="ts" setup>
defineProps<{
  summaryLabel: string;
  hasSelection: boolean;
  clearLabel:   string;
}>();

const emit = defineEmits<{ (e: "clear"): void }>();
</script>

<template>
  <div class="cal-footer">
    <span class="cal-summary">
      <svg class="cal-summary-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
        <path d="M4 1V3M8 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M1 5H11" stroke="currentColor" stroke-width="1.2"/>
      </svg>
      {{ summaryLabel }}
    </span>
    <button v-if="hasSelection" class="cal-clear" @click="emit('clear')">
      {{ clearLabel }}
    </button>
  </div>
</template>
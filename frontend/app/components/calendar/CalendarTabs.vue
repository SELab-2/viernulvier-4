<!--
  components/calendar/CalendarTabs.vue
  ======================================
  Mode selector tabs. Pure presentational — emits 'change' on click.
-->
<script lang="ts" setup>
import type { CalMode } from "./CalendarInputs.vue";

defineProps<{ mode: CalMode }>();
const emit = defineEmits<{ (e: "change", mode: CalMode): void }>();
const { t } = useI18n();

const MODES = ["single", "range", "after-selected", "before-selected"] as const;
</script>

<template>
  <div class="cal-tabs" role="tablist">
    <button
      v-for="m in MODES"
      :key="m"
      role="tab"
      :aria-selected="mode === m"
      :class="['cal-tab', { 'cal-tab--active': mode === m }]"
      @click="emit('change', m)"
    >
      {{ t(`stories.calendar.mode.${m}`) }}
    </button>
  </div>
</template>
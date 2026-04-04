<!--
  components/calendar.vue
  =======================
  General-purpose date-filter calendar. All user-visible strings via i18n.
  CSS lives in tailwind.css (Calendar component section).
-->
<script lang="ts" setup>
import CalendarGrid   from "~/components/calendar/CalendarGrid.vue";
import CalendarInputs from "~/components/calendar/CalendarInputs.vue";
import type { CalMode } from "~/components/calendar/CalendarInputs.vue";

interface DateFilter {
  after?:  string;
  before?: string;
}

const props = withDefaults(defineProps<{
  oldestDate?: string;
}>(), {
  oldestDate: "",
});

const emit = defineEmits<{
  (e: "update:filter", filter: DateFilter): void;
}>();

const { t, locale } = useI18n();

// Derive BCP-47 locale for Intl APIs from the i18n locale
const intlLocale = computed(() => locale.value === "en" ? "en-GB" : "nl-BE");

//  State
const mode      = ref<CalMode>("range");
const hoverDate = ref<string | null>(null);
const anchor    = ref<string | null>(null);
const selected  = ref<string | null>(null);
const selecting = ref(false);

const today     = new Date();
const viewYear  = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

// Derived 

const todayIso = computed(() => today.toISOString().slice(0, 10));

const filter = computed<DateFilter>(() => {
  switch (mode.value) {
    case "single":
      return selected.value ? { after: selected.value, before: selected.value } : {};
    case "range": {
      if (!anchor.value || !selected.value) return {};
      const [a, b] = sorted(anchor.value, selected.value);
      return { after: a, before: b };
    }
    case "date-to-now":
      return anchor.value ? { after: anchor.value, before: todayIso.value } : {};
    case "oldest":
      if (!props.oldestDate) return {};
      return selected.value
        ? { after: props.oldestDate, before: selected.value }
        : { after: props.oldestDate };
  }
});

const rightYear     = computed(() => viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value);
const rightMonthIdx = computed(() => (viewMonth.value + 1) % 12);
const leftMonth     = computed(() => buildMonth(viewYear.value, viewMonth.value));
const rightMonth    = computed(() => buildMonth(rightYear.value, rightMonthIdx.value));

const weekdays = computed(() => {
  const mon = new Date(2024, 0, 1); // known Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(1 + i);
    return d.toLocaleDateString(intlLocale.value, { weekday: "narrow" });
  });
});

const summaryLabel = computed<string>(() => {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(intlLocale.value, { day: "numeric", month: "short", year: "numeric" });

  switch (mode.value) {
    case "single":
      return selected.value ? fmt(selected.value) : "—";
    case "range":
      if (anchor.value && selected.value) return `${fmt(anchor.value)} → ${fmt(selected.value)}`;
      if (anchor.value && selecting.value) return `${fmt(anchor.value)} → …`;
      return "—";
    case "date-to-now":
      return anchor.value
        ? `${fmt(anchor.value)} → ${t("stories.calendar.today")}`
        : "—";
    case "oldest":
      return selected.value
        ? `${t("stories.calendar.oldest")} → ${fmt(selected.value)}`
        : "—";
  }
});

const hasSelection = computed(() => !!(anchor.value || selected.value));

// Helpers

function sorted(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

function buildMonth(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;

  const days: Array<{ iso: string; day: number } | null> = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push({ iso: new Date(year, month, d).toISOString().slice(0, 10), day: d });

  return {
    label: new Date(year, month, 1).toLocaleDateString(intlLocale.value, { month: "long", year: "numeric" }),
    days,
  };
}

// Day-state classifiers

function isSelected(iso: string): boolean {
  switch (mode.value) {
    case "single":      return iso === selected.value;
    case "range":       return iso === anchor.value || iso === selected.value;
    case "date-to-now": return iso === anchor.value || iso === todayIso.value;
    case "oldest":      return iso === selected.value;
  }
}

function isRangeStart(iso: string): boolean {
  if (mode.value === "range") {
    if (anchor.value && selected.value) return iso === sorted(anchor.value, selected.value)[0];
    return iso === anchor.value;
  }
  if (mode.value === "date-to-now") return iso === anchor.value;
  if (mode.value === "oldest")      return iso === props.oldestDate;
  return false;
}

function isRangeEnd(iso: string): boolean {
  if (mode.value === "range") {
    if (anchor.value && selected.value) return iso === sorted(anchor.value, selected.value)[1];
    return iso === selected.value;
  }
  if (mode.value === "date-to-now") return iso === todayIso.value;
  if (mode.value === "oldest")      return iso === selected.value;
  return false;
}

function isInRange(iso: string): boolean {
  let start: string | null = null;
  let end:   string | null = null;

  if (mode.value === "range") {
    const a = anchor.value, h = hoverDate.value;
    if (a && h && selecting.value) [start, end] = sorted(a, h);
    else if (a && selected.value)  [start, end] = sorted(a, selected.value);
  } else if (mode.value === "date-to-now" && anchor.value) {
    [start, end] = sorted(anchor.value, todayIso.value);
  } else if (mode.value === "oldest" && selected.value && props.oldestDate) {
    [start, end] = sorted(props.oldestDate, selected.value);
  }

  return !!start && !!end && iso > start && iso < end;
}

const isToday  = (iso: string) => iso === todayIso.value;
const isFuture = (iso: string) => iso > todayIso.value;

//  Click handlers

function clickDay(iso: string) {
  if (isFuture(iso)) return;
  switch (mode.value) {
    case "single":
      selected.value = iso;
      break;
    case "range":
      if (!selecting.value || !anchor.value) {
        anchor.value = iso; selected.value = null; selecting.value = true;
      } else {
        const [a, b] = sorted(anchor.value, iso);
        anchor.value = a; selected.value = b; selecting.value = false;
      }
      break;
    case "date-to-now":
      if (!selecting.value || !anchor.value) { anchor.value = iso; selecting.value = true; }
      else { selecting.value = false; }
      break;
    case "oldest":
      selected.value = iso; selecting.value = false;
      break;
  }
}

function prevMonth() {
  if (viewMonth.value === 0) { viewYear.value--; viewMonth.value = 11; }
  else viewMonth.value--;
}

function nextMonth() {
  if (viewMonth.value === 11) { viewYear.value++; viewMonth.value = 0; }
  else viewMonth.value++;
}

function switchMode(m: CalMode) {
  mode.value = m; anchor.value = null; selected.value = null; selecting.value = false;
}

function clearFilter() {
  anchor.value = null; selected.value = null; selecting.value = false;
}

function navigateTo(iso: string) {
  const d = new Date(iso);
  viewYear.value = d.getFullYear(); viewMonth.value = d.getMonth();
}

// Input handlers from CalendarInputs

function onApplySingle(iso: string) { selected.value = iso; navigateTo(iso); }

function onApplyRange(start: string, end: string) {
  const [a, b] = sorted(start, end);
  anchor.value = a; selected.value = b; navigateTo(a);
}

function onApplyStart(iso: string) {
  anchor.value = iso; selected.value = null; navigateTo(iso);
}

function onApplyEnd(iso: string) { selected.value = iso; navigateTo(iso); }

watch(filter, (val) => emit("update:filter", val), { deep: true });
</script>

<template>
  <div class="cal-root" @mouseleave="hoverDate = null">

    <!-- Mode tabs -->
    <div class="cal-tabs" role="tablist">
      <button
        v-for="m in (['single', 'range', 'date-to-now', 'oldest'] as const)"
        :key="m"
        role="tab"
        :aria-selected="mode === m"
        :class="['cal-tab', { 'cal-tab--active': mode === m }]"
        @click="switchMode(m)"
      >
        {{ t(`stories.calendar.mode.${m}`) }}
      </button>
    </div>

    <!-- Manual text inputs -->
    <CalendarInputs
      :mode="mode"
      :oldest-date="oldestDate"
      @apply-single="onApplySingle"
      @apply-range="onApplyRange"
      @apply-start="onApplyStart"
      @apply-end="onApplyEnd"
    />

    <!-- Two-month grid -->
    <div class="cal-months">
      <button
        class="cal-nav cal-nav--prev"
        :aria-label="t('stories.calendar.prevMonth')"
        @click="prevMonth"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

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
        @click-day="clickDay"
        @hover-day="(iso) => (hoverDate = iso)"
        @leave-day="hoverDate = null"
      />

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
        @click-day="clickDay"
        @hover-day="(iso) => (hoverDate = iso)"
        @leave-day="hoverDate = null"
      />

      <button
        class="cal-nav cal-nav--next"
        :aria-label="t('stories.calendar.nextMonth')"
        @click="nextMonth"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2L10 7L5 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Footer -->
    <div class="cal-footer">
      <span class="cal-summary">
        <svg class="cal-summary-icon" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2"/>
          <path d="M4 1V3M8 1V3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M1 5H11" stroke="currentColor" stroke-width="1.2"/>
        </svg>
        {{ summaryLabel }}
      </span>
      <button v-if="hasSelection" class="cal-clear" @click="clearFilter">
        {{ t("stories.calendar.clear") }}
      </button>
    </div>

  </div>
</template>
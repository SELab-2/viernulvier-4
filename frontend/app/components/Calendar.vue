<!--
  components/calendar.vue
  =======================
  Orchestrates all sub-components. Owns all state; children are presentational.
  Sync flow:
    calendar click  → clickDay() → anchor/selected refs update
                    → syncStart/syncEnd/syncSingle props flow down to CalendarInputs
    text input      → CalendarInputs emits apply-* → parent updates state + navigates
-->
<script lang="ts" setup>
import CalendarTabs   from "~/components/calendar/CalendarTabs.vue";
import CalendarInputs from "~/components/calendar/CalendarInputs.vue";
import CalendarMonths from "~/components/calendar/CalendarMonths.vue";
import CalendarFooter from "~/components/calendar/CalendarFooter.vue";
import type { CalMode }    from "~/components/calendar/CalendarInputs.vue";
import type { MonthData }  from "~/components/calendar/CalendarMonths.vue";

interface DateFilter {
  after?:  string;
  before?: string;
}

const props = withDefaults(defineProps<{
  oldestDate?:   string;
  modelFilter?:  DateFilter;
}>(), {
  oldestDate:  "",
  modelFilter: () => ({}),
});

const emit = defineEmits<{
  (e: "update:filter", filter: DateFilter): void;
}>();

const { t, locale } = useI18n();

const intlLocale = computed(() => locale.value === "en" ? "en-GB" : "nl-BE");

// ── Timezone-safe helpers ─────────────────────────────────────────────────────

function localIso(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const todayIso = computed(() => localIso(new Date()));

// ── State ─────────────────────────────────────────────────────────────────────

const mode      = ref<CalMode>("range");
const hoverDate = ref<string | null>(null);
const anchor    = ref<string | null>(null);
const selected  = ref<string | null>(null);
const selecting = ref(false);

const today     = new Date();
const viewYear  = ref(today.getFullYear());
const viewMonth = ref(today.getMonth());

// ── Sync props for CalendarInputs (calendar → text fields) ────────────────────
// These computed values mirror the current selection into the input components.

const syncSingle = computed(() =>
  mode.value === "single" ? (selected.value ?? undefined) : undefined
);

const syncStart = computed(() => {
  if (mode.value === "range" || mode.value === "after-selected")
    return anchor.value ?? undefined;
  return undefined;
});

const syncEnd = computed(() => {
  if (mode.value === "range" || mode.value === "before-selected")
    return selected.value ?? undefined;
  return undefined;
});

// ── Month grid data ───────────────────────────────────────────────────────────

const rightYear     = computed(() => viewMonth.value === 11 ? viewYear.value + 1 : viewYear.value);
const rightMonthIdx = computed(() => (viewMonth.value + 1) % 12);

const weekdays = computed(() => {
  const mon = new Date(2024, 0, 1); // known Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(1 + i);
    return d.toLocaleDateString(intlLocale.value, { weekday: "narrow" });
  });
});

function buildMonth(year: number, month: number): MonthData {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday = 0

  const days: MonthData["days"] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++)
    days.push({ iso: localIso(new Date(year, month, d)), day: d });

  return {
    label: firstDay.toLocaleDateString(intlLocale.value, { month: "long", year: "numeric" }),
    days,
  };
}

const leftMonth  = computed(() => buildMonth(viewYear.value,  viewMonth.value));
const rightMonth = computed(() => buildMonth(rightYear.value, rightMonthIdx.value));

/** ISO of the first visible day (used for oldest-mode range-start capping) */
const viewportStart = computed(() => {
  const m = String(viewMonth.value + 1).padStart(2, "0");
  return `${viewYear.value}-${m}-01`;
});

// ── Filter output ─────────────────────────────────────────────────────────────

const filter = computed<DateFilter>(() => {
  switch (mode.value) {
    case "single":
      return selected.value
        ? { after: selected.value, before: selected.value }
        : {};

    case "range": {
      if (!anchor.value || !selected.value) return {};
      const [a, b] = sorted(anchor.value, selected.value);
      return { after: a, before: b };
    }

    case "after-selected":
      return anchor.value
        ? { after: anchor.value, before: todayIso.value }
        : {};

    case "before-selected":
      if (!props.oldestDate) return {};
      return selected.value
        ? { after: props.oldestDate, before: selected.value }
        : { after: props.oldestDate };
  }
});

// ── Summary label ─────────────────────────────────────────────────────────────

const summaryLabel = computed<string>(() => {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(intlLocale.value, {
      day: "numeric", month: "short", year: "numeric",
    });

  switch (mode.value) {
    case "single":
      return selected.value ? fmt(selected.value) : "—";

    case "range":
      if (anchor.value && selected.value)  return `${fmt(anchor.value)} → ${fmt(selected.value)}`;
      if (anchor.value && selecting.value) return `${fmt(anchor.value)} → …`;
      return "—";

    case "after-selected":
      return anchor.value
        ? `${fmt(anchor.value)} → ${t("stories.calendar.today")}`
        : "—";

    case "before-selected":
      return selected.value
        ? `${t("stories.calendar.oldest")} → ${fmt(selected.value)}`
        : "—";
  }
});

const hasSelection = computed(() => !!(anchor.value || selected.value));

// ── Day-state classifiers ─────────────────────────────────────────────────────

function sorted(a: string, b: string): [string, string] {
  return a <= b ? [a, b] : [b, a];
}

const isToday  = (iso: string) => iso === todayIso.value;
const isFuture = (iso: string) => iso > todayIso.value;

function isSelected(iso: string): boolean {
  switch (mode.value) {
    case "single":          return iso === selected.value;
    case "range":           return iso === anchor.value || iso === selected.value;
    case "after-selected":  return iso === anchor.value || iso === todayIso.value;
    case "before-selected": return iso === selected.value;
  }
}

function isRangeStart(iso: string): boolean {
  if (mode.value === "range") {
    if (anchor.value && selected.value)
      return iso === sorted(anchor.value, selected.value)[0];
    return iso === anchor.value;
  }
  if (mode.value === "after-selected") return iso === anchor.value;
  if (mode.value === "before-selected" && props.oldestDate && selected.value) {
    if (iso === props.oldestDate) return true;
    if (props.oldestDate < viewportStart.value)
      return iso === viewportStart.value;
  }
  return false;
}

function isRangeEnd(iso: string): boolean {
  if (mode.value === "range") {
    if (anchor.value && selected.value)
      return iso === sorted(anchor.value, selected.value)[1];
    return iso === selected.value;
  }
  if (mode.value === "after-selected")  return iso === todayIso.value;
  if (mode.value === "before-selected") return iso === selected.value;
  return false;
}

function isInRange(iso: string): boolean {
  let start: string | null = null;
  let end:   string | null = null;

  if (mode.value === "range") {
    const a = anchor.value, h = hoverDate.value;
    if (a && h && selecting.value) [start, end] = sorted(a, h);
    else if (a && selected.value)  [start, end] = sorted(a, selected.value);
  } else if (mode.value === "after-selected" && anchor.value) {
    [start, end] = sorted(anchor.value, todayIso.value);
  } else if (mode.value === "before-selected" && selected.value && props.oldestDate) {
    [start, end] = sorted(props.oldestDate, selected.value);
  }

  return !!start && !!end && iso > start && iso < end;
}

// ── Interaction ───────────────────────────────────────────────────────────────

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
    case "after-selected":
      anchor.value = iso; selecting.value = false;
      break;
    case "before-selected":
      selected.value = iso; selecting.value = false;
      break;
  }
}

function navigateTo(iso: string) {
  const parts = iso.split("-").map(Number) as [number, number, number];
  viewYear.value  = parts[0];
  viewMonth.value = parts[1] - 1;
}

function switchMode(m: CalMode) {
  mode.value = m;
  anchor.value = null;
  selected.value = null;
  selecting.value = false;
}

function clearFilter() {
  anchor.value = null;
  selected.value = null;
  selecting.value = false;
}

// ── Input handlers (text → calendar) ─────────────────────────────────────────

function onApplySingle(iso: string) {
  selected.value = iso;
  navigateTo(iso);
}

function onApplyRange(start: string, end: string) {
  const [a, b] = sorted(start, end);
  anchor.value = a; selected.value = b;
  navigateTo(a);
}

function onApplyStart(iso: string) {
  anchor.value = iso; selected.value = null;
  navigateTo(iso);
}

function onApplyEnd(iso: string) {
  selected.value = iso;
  navigateTo(iso);
}


// ── Restore state from an externally held filter
// Called once on mount. Figures out which mode the saved filter implies and
// restores anchor + selected so the clear button reappears immediately.

function restoreFromFilter(f: DateFilter) {
  if (!f.after && !f.before) return;

  if (f.after && f.before && f.after === f.before) {
    mode.value     = "single";
    selected.value = f.after;
    navigateTo(f.after);
    return;
  }

  if (f.after && props.oldestDate && f.after === props.oldestDate && f.before) {
    mode.value     = "before-selected";
    selected.value = f.before;
    navigateTo(f.before);
    return;
  }
  if (f.after && f.before && f.before === todayIso.value) {
    mode.value    = "after-selected";
    anchor.value  = f.after;
    navigateTo(f.after);
    return;
  }
  if (f.after && f.before) {
    mode.value     = "range";
    anchor.value   = f.after;
    selected.value = f.before;
    navigateTo(f.after);
    return;
  }
  if (f.after && props.oldestDate && f.after === props.oldestDate) {
    mode.value = "before-selected";
    return;
  }
}

onMounted(() => {
  if (props.modelFilter) restoreFromFilter(props.modelFilter);
});

watch(filter, (val) => emit("update:filter", val), { deep: true });
</script>

<template>
  <div class="cal-root" @mouseleave="hoverDate = null">

    <CalendarTabs :mode="mode" @change="switchMode" />

    <CalendarInputs
      :mode="mode"
      :oldest-date="oldestDate"
      :sync-single="syncSingle"
      :sync-start="syncStart"
      :sync-end="syncEnd"
      @apply-single="onApplySingle"
      @apply-range="onApplyRange"
      @apply-start="onApplyStart"
      @apply-end="onApplyEnd"
    />

    <CalendarMonths
      :left-month="leftMonth"
      :right-month="rightMonth"
      :weekdays="weekdays"
      :is-selected="isSelected"
      :is-range-start="isRangeStart"
      :is-range-end="isRangeEnd"
      :is-in-range="isInRange"
      :is-today="isToday"
      :is-future="isFuture"
      :prev-label="t('stories.calendar.prevMonth')"
      :next-label="t('stories.calendar.nextMonth')"
      @click-day="clickDay"
      @hover-day="(iso) => (hoverDate = iso)"
      @leave-day="hoverDate = null"
      @prev="() => { if (viewMonth === 0) { viewYear--; viewMonth = 11; } else viewMonth--; }"
      @next="() => { if (viewMonth === 11) { viewYear++; viewMonth = 0; } else viewMonth++; }"
    />

    <CalendarFooter
      :summary-label="summaryLabel"
      :has-selection="hasSelection"
      :clear-label="t('stories.calendar.clear')"
      @clear="clearFilter"
    />

  </div>
</template>
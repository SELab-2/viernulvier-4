<!--
  components/calendar/CalendarInputs.vue
  ========================================
  Manual date input row. Synced bidirectionally with the calendar grid:
  - Typing + Enter  → emits up to parent (parent updates calendar)
  - Calendar click  → parent pushes syncSingle/syncStart/syncEnd props down
                       which updates the displayed text fields
-->
<script lang="ts" setup>
export type CalMode = "single" | "range" | "after-selected" | "before-selected";

const props = defineProps<{
  mode:        CalMode;
  oldestDate:  string;
  /** Sync: calendar selection reflected in text fields */
  syncSingle?: string;
  syncStart?:  string;
  syncEnd?:    string;
}>();

const emit = defineEmits<{
  (e: "apply-single", iso: string):               void;
  (e: "apply-range",  start: string, end: string): void;
  (e: "apply-start",  iso: string):               void;
  (e: "apply-end",    iso: string):               void;
}>();

const { t } = useI18n();

const inputSingle = ref("");
const inputStart  = ref("");
const inputEnd    = ref("");

const errorSingle = ref(false);
const errorStart  = ref(false);
const errorEnd    = ref(false);

// ── Format helpers ────────────────────────────────────────────────────────────

/** Display ISO as DD/MM/YYYY to match the placeholder hint */
function formatForInput(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

// ── Sync: calendar → inputs ───────────────────────────────────────────────────
// When the parent reports a new calendar selection, reflect it in the text fields.
// This overwrites whatever the user had typed, since a click is the authoritative action.

watch(() => props.syncSingle, (v) => {
  inputSingle.value = v ? formatForInput(v) : "";
  errorSingle.value = false;
});

watch(() => props.syncStart, (v) => {
  inputStart.value = v ? formatForInput(v) : "";
  errorStart.value = false;
});

watch(() => props.syncEnd, (v) => {
  inputEnd.value = v ? formatForInput(v) : "";
  errorEnd.value = false;
});

// ── Timezone-safe helpers ─────────────────────────────────────────────────────

function localTodayIso(): string {
  const d  = new Date();
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function validateIso(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth()    !== m - 1 ||
    date.getDate()     !== d
  ) return null;
  if (iso > localTodayIso()) return null;
  return iso;
}

function parseDate(raw: string): string | null {
  const val = raw.replace(/[^\d\/\-\.]/g, "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return validateIso(val);
  const parts = val.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    if (yyyy?.length === 4 && dd && mm)
      return validateIso(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`);
  }
  return null;
}

// ── Handlers ──────────────────────────────────────────────────────────────────

function tryApplySingle() {
  const iso = parseDate(inputSingle.value);
  errorSingle.value = !!inputSingle.value && !iso;
  if (iso) emit("apply-single", iso);
}

function tryApplyRange() {
  const s = parseDate(inputStart.value);
  const e = parseDate(inputEnd.value);
  errorStart.value = !!inputStart.value && !s;
  errorEnd.value   = !!inputEnd.value   && !e;
  if (s && e) emit("apply-range", s, e);
  else if (s) emit("apply-start", s);
}

function tryApplyStart() {
  const iso = parseDate(inputStart.value);
  errorStart.value = !!inputStart.value && !iso;
  if (iso) emit("apply-start", iso);
}

function tryApplyEnd() {
  const iso = parseDate(inputEnd.value);
  errorEnd.value = !!inputEnd.value && !iso;
  if (iso) emit("apply-end", iso);
}

// Clear errors while typing
watch(inputSingle, () => { errorSingle.value = false; });
watch(inputStart,  () => { errorStart.value  = false; });
watch(inputEnd,    () => { errorEnd.value    = false; });

// Reset fields on mode switch
watch(() => props.mode, () => {
  inputSingle.value = "";
  inputStart.value  = "";
  inputEnd.value    = "";
  errorSingle.value = false;
  errorStart.value  = false;
  errorEnd.value    = false;
});
</script>

<template>
  <div class="cal-inputs">

    <!-- Single -->
    <template v-if="mode === 'single'">
      <div class="cal-input-group">
        <label class="cal-input-label">
          {{ t("stories.calendar.date") }}
          <span class="cal-input-hint">{{ t("stories.calendar.dateHint") }}</span>
        </label>
        <div class="cal-input-row">
          <input
            v-model="inputSingle"
            :class="['cal-input', { 'cal-input--error': errorSingle }]"
            :placeholder="t('stories.calendar.datePlaceholder')"
            maxlength="10"
            @keydown.enter="tryApplySingle"
          />
          <button class="cal-input-btn" :aria-label="t('stories.calendar.apply')" @click="tryApplySingle">→</button>
        </div>
        <span v-if="errorSingle" class="cal-input-error">{{ t("stories.calendar.invalidDate") }}</span>
      </div>
    </template>

    <!-- Range -->
    <template v-else-if="mode === 'range'">
      <div class="cal-input-group">
        <label class="cal-input-label">
          {{ t("stories.calendar.from") }}
          <span class="cal-input-hint">{{ t("stories.calendar.dateHint") }}</span>
        </label>
        <div class="cal-input-row">
          <input
            v-model="inputStart"
            :class="['cal-input', { 'cal-input--error': errorStart }]"
            :placeholder="t('stories.calendar.fromPlaceholder')"
            maxlength="10"
            @keydown.enter="tryApplyRange"
          />
        </div>
        <span v-if="errorStart" class="cal-input-error">{{ t("stories.calendar.invalidDate") }}</span>
      </div>
      <div class="cal-input-sep" aria-hidden="true">→</div>
      <div class="cal-input-group">
        <label class="cal-input-label">
          {{ t("stories.calendar.to") }}
          <span class="cal-input-hint">{{ t("stories.calendar.dateHint") }}</span>
        </label>
        <div class="cal-input-row">
          <input
            v-model="inputEnd"
            :class="['cal-input', { 'cal-input--error': errorEnd }]"
            :placeholder="t('stories.calendar.toPlaceholder')"
            maxlength="10"
            @keydown.enter="tryApplyRange"
          />
          <button class="cal-input-btn" :aria-label="t('stories.calendar.apply')" @click="tryApplyRange">→</button>
        </div>
        <span v-if="errorEnd" class="cal-input-error">{{ t("stories.calendar.invalidDate") }}</span>
      </div>
    </template>

    <!-- After selected (was: date-to-now) -->
    <template v-else-if="mode === 'after-selected'">
      <div class="cal-input-group">
        <label class="cal-input-label">
          {{ t("stories.calendar.from") }}
          <span class="cal-input-hint">{{ t("stories.calendar.dateHint") }}</span>
        </label>
        <div class="cal-input-row">
          <input
            v-model="inputStart"
            :class="['cal-input', { 'cal-input--error': errorStart }]"
            :placeholder="t('stories.calendar.fromPlaceholder')"
            maxlength="10"
            @keydown.enter="tryApplyStart"
          />
          <button class="cal-input-btn" :aria-label="t('stories.calendar.apply')" @click="tryApplyStart">→</button>
        </div>
        <span v-if="errorStart" class="cal-input-error">{{ t("stories.calendar.invalidDate") }}</span>
      </div>
      <div class="cal-input-sep" aria-hidden="true">→</div>
      <div class="cal-input-group">
        <label class="cal-input-label">{{ t("stories.calendar.endDate") }}</label>
        <div class="cal-badge">{{ t("stories.calendar.today") }}</div>
      </div>
    </template>

    <!-- Before selected (was: oldest) -->
    <template v-else>
      <div class="cal-input-group">
        <label class="cal-input-label">{{ t("stories.calendar.startDate") }}</label>
        <div class="cal-badge cal-badge--muted">{{ t("stories.calendar.oldest") }}</div>
      </div>
      <div class="cal-input-sep" aria-hidden="true">→</div>
      <div class="cal-input-group">
        <label class="cal-input-label">
          {{ t("stories.calendar.to") }}
          <span class="cal-input-hint">{{ t("stories.calendar.dateHint") }}</span>
        </label>
        <div class="cal-input-row">
          <input
            v-model="inputEnd"
            :class="['cal-input', { 'cal-input--error': errorEnd }]"
            :placeholder="t('stories.calendar.toPlaceholder')"
            maxlength="10"
            @keydown.enter="tryApplyEnd"
          />
          <button class="cal-input-btn" :aria-label="t('stories.calendar.apply')" @click="tryApplyEnd">→</button>
        </div>
        <span v-if="errorEnd" class="cal-input-error">{{ t("stories.calendar.invalidDate") }}</span>
      </div>
    </template>

  </div>
</template>
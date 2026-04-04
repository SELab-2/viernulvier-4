<!--
  components/calendar/CalendarInputs.vue
  ========================================
  Manual date input row. All labels via i18n (stories.calendar.*).

  Security: raw user text is NEVER passed to the parent. parseDate() strips
  everything except digits and separators, then validates the result is a real
  calendar date (no 2023-02-31, no future dates). Only a safe YYYY-MM-DD
  string or nothing reaches the emit.
-->
<script lang="ts" setup>
export type CalMode = "single" | "range" | "date-to-now" | "oldest";

const props = defineProps<{
  mode:       CalMode;
  oldestDate: string;
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

// ─── Strict date parsing & validation ────────────────────────────────────────

const todayIso = new Date().toISOString().slice(0, 10);

/**
 * Strip all non-digit, non-separator characters first, then parse.
 * Returns a valid YYYY-MM-DD ≤ today, or null.
 */
function parseDate(raw: string): string | null {
  // Allow only digits and the three separator characters
  const val = raw.replace(/[^\d\/\-\.]/g, "").trim();

  let iso: string | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    iso = val;
  } else {
    const parts = val.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (y && y.length === 4 && d && m)
        iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }

  if (!iso) return null;

  // Validate: must be a real date and not in the future
  const date = new Date(iso);
  if (isNaN(date.getTime()))              return null; // invalid date
  if (date.toISOString().slice(0, 10) !== iso) return null; // day overflow (e.g. Feb 31)
  if (iso > todayIso)                     return null; // future

  return iso;
}

// ─── Handlers ────────────────────────────────────────────────────────────────

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

// Clear errors while typing; reset inputs on mode switch
watch(inputSingle, () => { errorSingle.value = false; });
watch(inputStart,  () => { errorStart.value  = false; });
watch(inputEnd,    () => { errorEnd.value    = false; });

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

    <!-- Date-to-now -->
    <template v-else-if="mode === 'date-to-now'">
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

    <!-- Oldest -->
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
<!--
  components/blogs/YearPicker.vue
  ================================
  Pill-style year filter used inside StoryToolbar's filter panel.

  - Derives the selectable year range from `oldestDate` / `newestDate` (ISO
    strings), descending so the most recent year appears first.
  - Emits `update:modelValue` with the selected year (number) or `null` when
    the selection is cleared — keeping the parent in full control of state.
  - Renders a dashed "clear" pill next to the year pills whenever a year is
    selected, so the user can deselect without clicking the active pill again.
-->

<script lang="ts" setup>
import { isoYear } from "~/utils/formatters";

const props = defineProps<{
  modelValue: number | null;
  oldestDate: string;
  newestDate: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", year: number | null): void;
}>();

const { t } = useI18n();

const years = computed<number[]>(() => {
  if (!props.oldestDate || !props.newestDate) return [];
  const start = isoYear(props.oldestDate);
  const end = isoYear(props.newestDate);
  const arr: number[] = [];
  for (let y = end; y >= start; y--) arr.push(y);
  return arr;
});

function toggleYear(year: number) {
  emit("update:modelValue", props.modelValue === year ? null : year);
}

function clearYear() {
  emit("update:modelValue", null);
}
</script>

<template>
  <div class="year-pills">
    <button
      v-for="year in years"
      :key="year"
      type="button"
      class="year-pill"
      :data-selected="modelValue === year ? true : undefined"
      @click="toggleYear(year)"
    >
      {{ year }}
    </button>

    <button
      v-if="modelValue !== null"
      type="button"
      class="year-pill year-pill--clear"
      @click="clearYear"
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
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      {{ t("stories.filters.clear") }}
    </button>

    <div v-if="years.length === 0" class="year-empty">—</div>
  </div>
</template>

<style scoped>
.year-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.year-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  transition: all 0.12s;
}
.year-pill:hover {
  border-color: var(--blog-purple-strong);
  background: var(--blog-purple-ghost);
  color: var(--blog-purple-strong);
}
.year-pill[data-selected] {
  border-color: var(--blog-purple-strong);
  background: var(--blog-purple-strong);
  color: #fff;
}

.year-pill--clear {
  border-style: dashed;
  border-color: var(--blog-purple-strong);
  background: var(--blog-purple-ghost);
  color: var(--blog-purple-strong);
}
.year-pill--clear:hover {
  background: var(--blog-purple-strong);
  color: #fff;
}

.year-empty {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  opacity: 0.5;
}
</style>

<!--
  YearRangeSlider.vue
  ====================
  Dual-handle range slider for selecting a range of years.

  Props:
  - modelValue:  [fromYear, toYear] — always sorted (min first)
  - oldestYear:  minimum selectable year
  - newestYear:  maximum selectable year

  Emits:
  - update:modelValue — [fromYear, toYear] sorted whenever a handle moves

  Design notes:
  - Two independent handles that can freely cross each other (smooth crossing UX)
  - Handles snap to integer years on pointer-up
  - Each handle shows its current year as a label above it
  - The filled track segment is always drawn between the two handles
-->

<script lang="ts" setup>
const props = defineProps<{
  modelValue: [number, number];
  oldestYear: number;
  newestYear: number;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: [number, number]];
}>();

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

function yearToFrac(year: number): number {
  const range = props.newestYear - props.oldestYear;
  if (range <= 0) return 0;
  return (year - props.oldestYear) / range;
}

function fracToYear(frac: number): number {
  const range = props.newestYear - props.oldestYear;
  return Math.round(props.oldestYear + frac * range);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const fracA = ref(yearToFrac(props.modelValue[0]));
const fracB = ref(yearToFrac(props.modelValue[1]));

// Sync handle positions from external modelValue (skip during active drag)
watch(
  () => props.modelValue,
  ([from, to]) => {
    if (!isDragging.value) {
      fracA.value = yearToFrac(from);
      fracB.value = yearToFrac(to);
    }
  },
  { deep: true },
);

// Re-sync when year bounds change (e.g., loaded asynchronously)
watch([() => props.oldestYear, () => props.newestYear], () => {
  if (!isDragging.value) {
    fracA.value = yearToFrac(props.modelValue[0]);
    fracB.value = yearToFrac(props.modelValue[1]);
  }
});

function getFracFromEvent(clientX: number): number {
  if (!trackRef.value) return 0;
  const rect = trackRef.value.getBoundingClientRect();
  return clamp((clientX - rect.left) / rect.width, 0, 1);
}

function startDrag(which: "a" | "b", event: PointerEvent) {
  event.preventDefault();
  isDragging.value = true;
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);

  function onMove(e: PointerEvent) {
    const f = getFracFromEvent(e.clientX);
    if (which === "a") fracA.value = f;
    else fracB.value = f;

    const yA = fracToYear(fracA.value);
    const yB = fracToYear(fracB.value);
    emit("update:modelValue", [Math.min(yA, yB), Math.max(yA, yB)]);
  }

  function onUp() {
    // Snap handles to exact year positions
    fracA.value = yearToFrac(fracToYear(fracA.value));
    fracB.value = yearToFrac(fracToYear(fracB.value));
    isDragging.value = false;
    target.removeEventListener("pointermove", onMove);
    target.removeEventListener("pointerup", onUp);
  }

  target.addEventListener("pointermove", onMove);
  target.addEventListener("pointerup", onUp);
}

// Handle keyboard navigation
function onKeyDown(which: "a" | "b", event: KeyboardEvent) {
  const step = 1 / Math.max(props.newestYear - props.oldestYear, 1);
  let delta = 0;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = -step;
  else if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = step;
  else return;

  event.preventDefault();
  if (which === "a") fracA.value = clamp(fracA.value + delta, 0, 1);
  else fracB.value = clamp(fracB.value + delta, 0, 1);

  const yA = fracToYear(fracA.value);
  const yB = fracToYear(fracB.value);
  emit("update:modelValue", [Math.min(yA, yB), Math.max(yA, yB)]);
}

const yearA = computed(() => fracToYear(fracA.value));
const yearB = computed(() => fracToYear(fracB.value));
const leftFrac = computed(() => Math.min(fracA.value, fracB.value));
const rightFrac = computed(() => Math.max(fracA.value, fracB.value));
</script>

<template>
  <div class="yr-slider" :class="{ 'yr-slider--dragging': isDragging }">
    <div ref="trackRef" class="yr-track">
      <div class="yr-track-bg" />
      <div
        class="yr-track-fill"
        :style="{
          left: `${leftFrac * 100}%`,
          width: `${(rightFrac - leftFrac) * 100}%`,
        }"
      />

      <!-- Handle A -->
      <button
        class="yr-handle"
        :style="{ left: `${fracA * 100}%` }"
        role="slider"
        :aria-valuenow="yearA"
        :aria-valuemin="oldestYear"
        :aria-valuemax="newestYear"
        tabindex="0"
        @pointerdown.prevent="startDrag('a', $event)"
        @keydown="onKeyDown('a', $event)"
      >
        <span class="yr-handle-label">{{ yearA }}</span>
      </button>

      <!-- Handle B -->
      <button
        class="yr-handle"
        :style="{ left: `${fracB * 100}%` }"
        role="slider"
        :aria-valuenow="yearB"
        :aria-valuemin="oldestYear"
        :aria-valuemax="newestYear"
        tabindex="0"
        @pointerdown.prevent="startDrag('b', $event)"
        @keydown="onKeyDown('b', $event)"
      >
        <span class="yr-handle-label">{{ yearB }}</span>
      </button>
    </div>

    <!-- Track endpoint labels -->
    <div class="yr-endpoints">
      <span>{{ oldestYear }}</span>
      <span>{{ newestYear }}</span>
    </div>
  </div>
</template>

<style scoped>
.yr-slider {
  padding: 28px 8px 4px;
  user-select: none;
  -webkit-user-select: none;
}

.yr-track {
  position: relative;
  height: 4px;
}

.yr-track-bg {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  background: var(--border);
}

.yr-track-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 2px;
  background: var(--accent);
}

.yr-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--background);
  border: 2px solid var(--accent);
  cursor: grab;
  touch-action: none;
  padding: 0;
  outline: none;
  z-index: 1;
  transition:
    box-shadow 0.1s,
    transform 0.1s;
}

.yr-handle:hover,
.yr-handle:focus-visible {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 20%, transparent);
  transform: translate(-50%, -50%) scale(1.15);
}

.yr-slider--dragging .yr-handle {
  cursor: grabbing;
}

.yr-handle-label {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  white-space: nowrap;
  pointer-events: none;
}

.yr-endpoints {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  opacity: 0.5;
}
</style>

<!-- 
 HomeRandomYears.vue
 * SUMMARY:
 This component generates a dynamic list of year-range navigation buttons (e.g., "2015 - 2019").
 * KEY FUNCTIONS:
  1. Fetches the oldest event from the database to determine the dynamic "lowestYear" starting point.
  2. Calculates year buckets based on a configurable `gap` prop.
  3. Handles navigation to the Archive/Productions page by pre-filling the global `dateFilter` 
 composable state before routing.
 * FEATURES:
  - Glassmorphism UI styling for hero-section integration.
  - Reactive range calculation based on the current year.
-->

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ROUTES } from "~/utils/routes";

// A range for years with it's label.
interface YearRange {
  start: number;
  end: number;
  label: string;
}

// Composables.
const router = useRouter();
const { getAll } = useEventApi();
const { dateFilter } = useArchiveView();

// Props
// Gap is how much years gap to leave between start-end
const props = defineProps<{
  gap: number;
}>();

// Lowest and highest years should be fine like this whenever something fails.
const HIGHEST_YEAR = new Date().getFullYear();
const lowestYear = ref<number>(HIGHEST_YEAR);

// Computes the ranges in which productions can be.
const ranges = computed<YearRange[]>(() => {
  if (lowestYear.value >= HIGHEST_YEAR) return [];

  const result: YearRange[] = [];
  // Round the lowest year down to a multiple of gap.
  let currentStart = Math.floor(lowestYear.value / props.gap) * props.gap;

  while (currentStart <= HIGHEST_YEAR) {
    const currentEnd = Math.min(currentStart + props.gap - 1, HIGHEST_YEAR);

    result.push({
      start: currentStart,
      end: currentEnd,
      label: `${currentStart} - ${currentEnd}`,
    });

    currentStart += props.gap;
  }

  return result;
});

// Loads the years that are in the DB.
async function loadYears() {
  const resp = await getAll({
    paginationFilters: { page: 0, limit: 1, descending: false },
  });
  const firstEvent = resp.data?.objects[0];

  if (firstEvent !== undefined && firstEvent.endtime) {
    lowestYear.value = new Date(firstEvent.endtime).getFullYear();
  }
}

// Navigate to the productions page and apply date filters
function goToRange(start: number, end: number) {
  const today = new Date();

  const startDate = new Date(start, 0, 1);
  const endDate = new Date(end, today.getMonth(), today.getDate() + 1);

  dateFilter.value = {
    after: startDate.toISOString().split("T")[0],
    before: endDate.toISOString().split("T")[0],
  };

  router.push({
    path: ROUTES.productions.base,
  });
}

onMounted(loadYears);
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="range in ranges"
        :key="range.start"
        @click="goToRange(range.start, range.end)"
        class="inline-flex h-9 items-center justify-center rounded-full border border-border/30 bg-background/40 backdrop-blur-sm px-4 font-brand text-xs font-black uppercase tracking-widest text-foreground/80 transition-all duration-200 hover:border-accent/60 hover:bg-accent/15 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 outline-none cursor-pointer"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

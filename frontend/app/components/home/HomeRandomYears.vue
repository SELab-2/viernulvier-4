<!-- components/home/HomeRandomYears.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Calendar } from "lucide-vue-next";

interface YearRange {
  start: number;
  end: number;
  label: string;
}

const router = useRouter();
const { getAll } = useEventApi();
const { dateFilter } = useArchiveView();

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

  // If we have a first event we can load the lowest year.
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
  <div class="space-y-4">
    <div
      class="flex items-center gap-2 text-muted-foreground border-b border-border/30 pb-2"
    >
      <Calendar :size="14" stroke-width="3" class="text-accent" />
      <span class="font-brand text-[10px] font-black uppercase tracking-widest">
        Duik in de tijd
      </span>
    </div>

    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="range in ranges"
        :key="range.start"
        @click="goToRange(range.start, range.end)"
        class="inline-flex h-8 items-center rounded border border-border/50 bg-transparent px-4 font-brand text-[12px] font-black italic tracking-widest text-foreground transition-all hover:scale-105 hover:border-foreground hover:bg-foreground hover:text-background focus:ring-2 focus:ring-foreground/50 outline-none"
      >
        {{ range.label }}
      </button>
    </div>
  </div>
</template>

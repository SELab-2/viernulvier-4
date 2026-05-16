<!--
 A reusable folder grid component, displays series folders, includes:
  - Folder icon cards, clickable series
  - Responsive grid (default: 4 items per row, can change to 3 -> 2)
  - Shows total series count
  - Empty state fallback when no series are available

 Usage:
  <SeriesFolderGrid
    :items="[[series1, 4], [series2, 2]]"
  />
  (Series are bundled with their production count.)
-->

<script setup lang="ts">
import type { SeriesView } from "@repo/common";

interface Props {
  items: [SeriesView, number][];
  totalPages: number;
}

const props = defineProps<Props>();
const { t } = useI18n();

const grid = computed(() =>
  props.totalPages > 1
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-5 items-start"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
);
</script>

<template>
  <!-- Grid -->
  <div v-if="items.length">
    <div :class="grid" class="w-full">
      <SeriesFolder
        v-for="[series, count] in items"
        :key="series.id"
        :series="series"
        :production-count="count"
      />
    </div>
  </div>

  <!-- No series (empty) -->
  <div
    v-if="!items.length"
    class="text-center text-gray-500 dark:text-gray-400"
  >
    {{ t("series.noSeries") }}
  </div>
</template>

<style scoped></style>

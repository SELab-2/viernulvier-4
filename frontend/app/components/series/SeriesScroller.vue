<!--
  A series display component:
  - series title,
  - series description
  - horizontally scrollable list of linked productions
  - empty state when no productions are linked

  Usage:
  <SeriesScroller
    :series="series"
    :productions="productions"
  />
-->

<script setup lang="ts">
import type { ProductionView, SeriesView } from "@repo/common";

interface Props {
  series: SeriesView;
  productions: ProductionView[];
}

defineProps<Props>();
const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-[20px] font-bold uppercase shrink-0">
        {{ series.titel }}
      </span>
      <span class="flex-1 h-px bg-border" />
      <span class="text-[11px] text-muted-foreground shrink-0">
        {{ productions.length }} {{ t("nav.productions") }}
      </span>
    </div>

    <!-- Description -->
    <p v-if="series.description" class="text-sm text-muted-foreground">
      {{ series.description }}
    </p>

    <!-- Horizontal scroller -->
    <div v-if="productions.length" class="mt-3">
      <div
        class="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border"
      >
        <SeriesScrollerItem
          v-for="production in productions"
          :key="production.id"
          :production="production"
        />
      </div>
    </div>

    <!-- Empty -->
    <div
      v-if="!productions.length"
      class="text-center text-gray-500 dark:text-gray-400 mt-3"
    >
      {{ t("series.noProductions") }}
    </div>
  </div>
</template>

<style scoped></style>

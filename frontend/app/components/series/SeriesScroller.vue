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
  <!-- Header -->
  <div class="flex items-center gap-3 mb-4">
    <span class="text-[20px] font-bold uppercase shrink-0">
      {{ series.titel }}
    </span>
    <span class="flex-1 h-px bg-border" />
    <span class="text-[11px] text-muted-foreground shrink-0">
      {{ productions.length }} {{ t("nav.productions") }}
    </span>
  </div>

  <!-- Horizontal scroller -->
  <div v-if="productions.length">
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
    class="text-center text-gray-500 dark:text-gray-400"
  >
    {{ t("series.noProductions") }}
  </div>
</template>

<style scoped></style>

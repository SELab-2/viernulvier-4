<!--
 * A single folder-icon card representing a series, includes:
 *  - Folder/FolderOpen icon
 *  - Series title + production count
 *  - Navigates to series detail page when clicked
 *
 * Usage:
 * <SeriesFolder
 *    :series="series"
 *    :production-count="productions.length"
 * />
-->

<script setup lang="ts">
import type { SeriesView } from "@repo/common";
import { Folder, FolderOpen } from "lucide-vue-next";
import { ROUTES } from "~/utils/routes";

defineProps<{
  series: SeriesView;
  productionCount: number;
}>();

const { t } = useI18n();
</script>

<template>
  <NuxtLink
    :to="ROUTES.series.byId(series.id)"
    class="group flex flex-col items-center gap-1.5 cursor-pointer select-none w-full"
  >
    <!-- Folder icon -->
    <div class="flex items-center justify-center">
      <FolderOpen
        class="hidden group-hover:block w-20 h-20 sm:w-28 sm:h-28 text-accent transition-colors duration-150"
        :stroke-width="1"
      />
      <Folder
        class="block group-hover:hidden w-20 h-20 sm:w-28 sm:h-28 text-muted-foreground transition-colors duration-150"
        :stroke-width="1"
      />
    </div>

    <!-- Series title -->
    <p
      class="text-[11px] font-bold uppercase text-center w-full group-hover:text-accent transition-colors duration-150 leading-tight line-clamp-2"
    >
      {{ series.titel }}
    </p>

    <!-- Production count -->
    <span
      class="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors duration-150 whitespace-nowrap"
    >
      {{ productionCount }} {{ t("nav.productions") }}
    </span>
  </NuxtLink>
</template>

<style scoped></style>

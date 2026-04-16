<script setup lang="ts">
/**
 * A reusable file grid component, displays files belonging to a specific category, includes:
 *  - Responsive grid (default: 4 items per row, can change to 3 -> 2)
 *  - Max 4 rows before pagination
 *  - File previews, clickable files
 *
 * Usage:
 * <PrintsFileGrid
 *    category="Affiche"
 *    :files="files"
 * />
 *
 * Example files:
 * const files: PrintItemView[] = [
 *    { id: 1, titel: 'AFFICHE-FESTIVAL-2025.PDF', description: '', url: '', created_at: '...', updated_at: '...' },
 *    { id: 2, titel: 'AFFICHE-VIDEODROOM-2024.PDF', description: '', url: '', created_at: '...', updated_at: '...' },
 * ]
 */
import type { PrintItemView } from "@repo/common";

interface Props {
  category: string;
  files: PrintItemView[];
  totalFiles: number;
}
const props = defineProps<Props>();
const { t } = useI18n();

// constants
const grid = computed(() =>
  props.totalFiles > 1
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-4 items-start"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
);
</script>

<template>
  <!-- Header -->
  <div class="flex items-center gap-3 mb-4">
    <span class="text-[20px] font-bold uppercase shrink-0">{{ category }}</span>
    <span class="flex-1 h-px bg-border" />
    <span class="text-[11px] text-muted-foreground shrink-0"
      >{{ totalFiles }} {{ t("prints.files") }}</span
    >
  </div>

  <!-- Grid -->
  <div v-if="files.length">
    <div :class="grid">
      <PrintsFileGridItem
        v-for="file in files"
        :key="file.id"
        :file="file"
        :category="category"
      />
    </div>

    <!-- No files (empty) -->
    <div
      v-if="!files.length"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t("prints.noFilesCat") }}
    </div>
  </div>
</template>

<style scoped></style>

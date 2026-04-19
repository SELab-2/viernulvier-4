<script setup lang="ts">
/**
 * A reusable file list component, displays files in a simple list, includes:
 *  - File name, category and date displayed per file
 *
 * Usage:
 * <PrintsFileList
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
  totalPages: number;
}
const props = defineProps<Props>();
const { t } = useI18n();

// file logic
const emit = defineEmits<{
  (e: "delete", file: PrintItemView): void;
}>();

// constants
const list = computed(() =>
  props.totalPages > 1 ? { minHeight: `${props.files.length * 63}px` } : {},
); // 63 is height of one row (approximately)
</script>

<template>
  <div>
    <!-- List -->
    <div
      v-if="files.length"
      class="rounded-lg border border-border overflow-hidden"
      :style="list"
    >
      <PrintsFileListItem
        v-for="file in files"
        :key="file.id"
        :file="file"
        :category="category"
        @delete="emit('delete', file)"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="!files.length"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t("prints.noFiles") }}
    </div>
  </div>
</template>

<style scoped></style>

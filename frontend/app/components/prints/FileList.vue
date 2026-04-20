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
  category: string | null;
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
// 63 is height of one row (approximately)
const whitespace = computed(() => ({
  minHeight: `${
    props.totalPages > 1
      ? Math.max(0, 945 - props.files.length * 63) // min 15 rows
      : props.files.length > 0
        ? Math.max(0, 315 - props.files.length * 63) // min 5 rows so the footer doesn't jump
        : 0
  }px`,
}));
</script>

<template>
  <div>
    <!-- List -->
    <div v-if="files.length">
      <div class="rounded-lg border border-border overflow-hidden">
        <PrintsFileListItem
          v-for="file in files"
          :key="file.id"
          :file="file"
          :category="
            category ? t(`prints.types.${category}`) : t('prints.types.all')
          "
          @delete="emit('delete', file)"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!files.length"
      class="text-center text-gray-500 dark:text-gray-400 min-h-[315px]"
    >
      {{ t("prints.noFiles") }}
    </div>

    <div :style="whitespace"></div>
  </div>
</template>

<style scoped></style>

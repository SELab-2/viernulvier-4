<script setup lang="ts">
/**
 * A reusable file list component, displays files in a simple list, includes:
 *  - File name, category and date displayed per file //TODO atm only year is displayed bc no actual data yet
 *
 * Usage:
 * <PrintsFileList
 *    category="Affiche"
 *    :files="files"
 * />
 *
 * Example files:
 * const files: PrintsFile[] = [
 *    { id: 1, name: 'AFFICHE-FESTIVAL-2025.PDF', year: 2025, image: null },
 *    { id: 2, name: 'AFFICHE-VIDEODROOM-2024.PDF', year: 2024, image: null },
 * ]
 */

import { FileText, Download, Trash2 } from "lucide-vue-next";
interface PrintsFile { //TODO replace this with actual object later
  id: number;
  name: string;
  year?: number;
  image?: string | null;
}

interface Props {
  category: string;
  files: PrintsFile[];
}
const props = defineProps<Props>();
const { t } = useI18n();

const openFile = (src: string) => window.open(src, '_blank')
const downloadFile = (src: string, name: string) => {
  const a = document.createElement('a') // creates a temporary html <a> element
  a.href = src
  a.download = name
  a.click()
}

// constants
const rowBase = "group relative flex items-center gap-4 px-4 py-3 border-t border-border bg-card hover:bg-card-hover transition-colors duration-150 cursor-pointer"
</script>

<template>
  <div>
    <!-- List -->
    <div v-if="files.length" class="rounded-lg border border-border overflow-hidden">
      <div
          v-for="file in props.files"
          :key="file.id"
          :class="rowBase"
          @click="file.image ? openFile(file.image) : undefined"
      >
        <!-- Icon -->
        <div class="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
          <FileText :size="18" class="text-muted-foreground" />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <p class="text-[13px] font-bold truncate group-hover:text-accent transition-colors duration-150">{{ file.name }}</p>
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            {{ category }}<span v-if="file.year"> • {{ file.year }}</span>
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-2 shrink-0">
          <button
              class="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
              @click.stop="file.image && downloadFile(file.image, file.name)"
          >
            <Download :size="15" />
          </button>
          <button
              class="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors duration-150"
              @click.stop="() => {}"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
        v-else
        class="rounded-lg border border-border bg-card p-4 text-[12px] text-muted-foreground"
    >
      {{ t('prints.noFiles') }}
    </div>
  </div>
</template>

<style scoped>

</style>
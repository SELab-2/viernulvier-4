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

import { FileText, ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common";

interface Props {
  category: string;
  files: PrintItemView[];
}
const props = defineProps<Props>();
const { t, locale } = useI18n();

// file logic
const openFile = (src: string) => window.open(src, "_blank");
const emit = defineEmits<{
  (e: "delete", file: PrintItemView): void;
}>();

// pagination
const ITEMS_PER_PAGE = 10;
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.files.length / ITEMS_PER_PAGE)),
);

const visibleFiles = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return props.files.slice(start, start + ITEMS_PER_PAGE);
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
}

// constants
const rowBase =
  "group relative flex items-center gap-4 px-4 py-3 border-t border-border bg-card hover:bg-card-hover transition-colors duration-150 cursor-pointer";
const list = computed(() =>
  totalPages.value > 1 ? { minHeight: `${ITEMS_PER_PAGE * 63}px` } : {},
); // 62 is height of one row (approximately)
const chevronButton =
  "w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:cursor-default";
</script>

<template>
  <div>
    <!-- List -->
    <div
      v-if="files.length"
      class="rounded-lg border border-border overflow-hidden"
      :style="list"
    >
      <div
        v-for="file in visibleFiles"
        :key="file.id"
        :class="rowBase"
        @click="file.url ? openFile(file.url) : undefined"
      >
        <!-- Icon -->
        <div
          class="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0"
        >
          <FileText :size="18" class="text-muted-foreground" />
        </div>

        <!-- File info -->
        <div class="flex-1 min-w-0">
          <p
            class="text-[13px] font-bold truncate group-hover:text-accent transition-colors duration-150"
          >
            {{ file.titel }}
          </p>

          <p
            class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5"
          >
            {{ category }} |
            <span v-if="file.created_at">
              {{
                new Date(file.created_at).toLocaleDateString(locale, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }}
            </span>
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-2 shrink-0" @click.stop>
          <AdminDownloadButton
            v-if="file.url"
            :label="t('prints.download')"
            :size="37"
            :src="file.url"
            :name="file.url"
          />
          <AdminDeleteButton
            :label="t('prints.delete')"
            :size="37"
            @click="emit('delete', file)"
          />
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 mt-6 h-9"
    >
      <button
        :class="chevronButton"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <ChevronLeft :size="16" />
      </button>

      <span
        class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2"
      >
        {{ currentPage }} / {{ totalPages }}
      </span>

      <button
        :class="chevronButton"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        <ChevronRight :size="16" />
      </button>
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

<script setup lang="ts">
/**
 * A reusable file grid component, displays files belonging to a specific category, includes:
 *  - Responsive grid (default: 4 items per row, can change to 3 -> 2)
 *  - Max 4 rows before pagination
 *  - File previews, clickable files
 *  - Thumbnail placeholders
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
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import type { PrintItemView } from "@repo/common";

interface Props {
  category: string;
  files: PrintItemView[];
}
const props = defineProps<Props>();
const { t, locale } = useI18n();

// responsive columns
const windowWidth = ref(1024);
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

const currentCols = computed(() => {
  // how many items there are currently in a row
  if (windowWidth.value >= 1024) return 4; // lg:grid-cols-4
  if (windowWidth.value >= 640) return 3; // sm:grid-cols-3
  return 2; // grid-cols-2
});

// pagination
const ROWS_PER_PAGE = 4;
const itemsPerPage = computed(() => ROWS_PER_PAGE * currentCols.value);
const currentPage = ref(1);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.files.length / itemsPerPage.value)),
);

const visibleFiles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return props.files.slice(start, start + itemsPerPage.value);
});

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  currentPage.value = page;
}

//constants
const fileLabel = "text-[11px] font-bold uppercase truncate";
const grid = computed(() =>
  totalPages.value > 1
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 grid-rows-4 items-start"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
);
const chevronButton =
  "w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:cursor-default";

const openFile = (src: string) => window.open(src, "_blank"); // for opening the PDF in a new browser tab
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <span class="text-[20px] font-bold uppercase shrink-0">{{
        category
      }}</span>
      <span class="flex-1 h-px bg-border" />
      <span class="text-[11px] text-muted-foreground shrink-0"
        >{{ files.length }} {{ t("prints.files") }}</span
      >
    </div>

    <!-- Grid -->
    <div v-if="files.length">
      <div :class="grid">
        <div
          v-for="file in visibleFiles"
          :key="file.id"
          class="group flex flex-col cursor-pointer"
        >
          <!-- Thumbnail -->
          <div
            class="relative w-full rounded-lg overflow-hidden border border-border aspect-[3/4] group-hover:border-accent/60 transition-colors duration-150"
          >
            <PdfThumbnail
              v-if="file.url && file.titel.toLowerCase().endsWith('.pdf')"
              :src="file.url"
            >
              <template #fallback>
                <ThumbnailPlaceholder
                  :id="file.id"
                  size="fill"
                  :show-icon="true"
                  :show-border="false"
                  :rounded="false"
                />
              </template>
            </PdfThumbnail>
            <img
              v-else-if="file.url"
              :src="file.url"
              :alt="file.titel"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              @click.stop="file.url ? openFile(file.url) : undefined"
            />
            <ThumbnailPlaceholder
              v-else
              :id="file.id"
              size="fill"
              :show-icon="true"
              :show-border="false"
              :rounded="false"
            />
          </div>

          <!-- File info -->
          <div class="mt-2">
            <p
              :class="[
                fileLabel,
                'group-hover:text-accent transition-colors duration-150',
              ]"
            >
              {{ file.titel }}
            </p>
            <div class="flex items-center gap-2 mt-1">
              <span
                :class="[
                  fileLabel,
                  'tracking-widest border border-border rounded px-1.5 py-0.5 text-muted-foreground',
                ]"
                >{{ category }}
              </span>
              <span
                v-if="file.created_at"
                class="text-[11px] text-muted-foreground ml-auto"
              >
                {{
                  new Date(file.created_at).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-center gap-2 mt-6 h-9">
        <button
          :class="chevronButton"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft :size="16" />
        </button>

        <span
          v-if="totalPages > 1"
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

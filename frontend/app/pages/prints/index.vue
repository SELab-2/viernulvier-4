<!--
  pages/prints/index.vue
  ========================
  Prints overview page.

  - Composes prints page layout
  - Fetches paginated print items from the API
  - Pagination is dynamically calculated based on:
    rows per page (4) × responsive column count (2–4)

-->

<script setup lang="ts">
import type { PrintItemView, PaginatedResponse } from "@repo/common";
import { usePrintApi } from "../../composables/media/usePrintApi";
import { usePrintView } from "../../composables/media/usePrintView";
import PrintsHeader from "../../components/prints/PrintsHeader.vue";
import PrintsToolbar from "../../components/prints/PrintsToolbar.vue";
import PrintsSkeleton from "../../components/prints/PrintsSkeleton.vue";
import FileGrid from "../../components/prints/FileGrid.vue";

const { t, locale } = useI18n();
const { getAll } = usePrintApi();
const {
  searchQuery,
  activeFilter,
  currentPage,
  totalItems,
  totalPages,
  loading,
  fetchError,
} = usePrintView();

// Filters

// Responsive columns
const prints = ref<PrintItemView[]>([]);
const ROWS_PER_PAGE = 4;
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
const LIMIT = computed(() => ROWS_PER_PAGE * currentCols.value);
const categoryLabel = computed(
  () => activeFilter.value ?? t("prints.types.all"),
);

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
}

const isFirstLoad = ref(true); // Only show skeleton on first load, not when going to another page
// (Or else footer "jumps" a bit since the array with prints is empty for a split second, which causes the grid to
// lose its height for a while since that part is dynamically computed.)
async function loadPage() {
  loading.value = true;
  fetchError.value = null;

  try {
    const raw = await getAll({
      paginationFilters: {
        page: currentPage.value,
        limit: LIMIT.value,
        descending: true,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      printItemFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(activeFilter.value ? { type: activeFilter.value } : {}),
      },
    });

    const paged = unwrap(raw);
    prints.value = (paged?.objects ?? []) as PrintItemView[];
    totalItems.value = paged?.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / LIMIT.value));
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    loading.value = false;
    isFirstLoad.value = false;
  }
}

watch([searchQuery, locale], () => {
  currentPage.value = 0;
  loadPage();
});
watch(activeFilter, () => {
  currentPage.value = 0;
  loadPage();
});
watch(currentCols, () => {
  currentPage.value = 0;
  loadPage();
});
watch(currentPage, loadPage, { immediate: false });

onMounted(loadPage);
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-[#151821] text-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <PrintsHeader />

    <PrintsToolbar
      @update:search="searchQuery = $event"
      @update:types="activeFilter = $event"
    />

    <div class="container mx-auto px-4 max-w-5xl pt-4 pb-8 sm:pt-6 sm:pb-12">
      <PrintsSkeleton v-if="loading && isFirstLoad" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20"
        >
          {{ t("prints.noPrints") }}
        </p>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-red-400"
        >
          {{ fetchError.message }}
        </p>
        <button
          class="mt-4 px-6 py-3 border font-brand font-black text-[11px] uppercase tracking-widest transition-all border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
          @click="loadPage()"
        >
          {{ t("prints.retry") }}
        </button>
      </div>

      <FileGrid
        :category="categoryLabel"
        :files="prints"
        :total-pages="totalPages"
      />

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <PrintsPageJumper
          :currentPage="currentPage"
          :totalPages="totalPages"
          :loading="loading"
          @go-to-page="currentPage = $event"
        />
        <PrintsPagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :loading="loading"
          @go-to-page="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>

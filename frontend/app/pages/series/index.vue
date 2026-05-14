<script setup lang="ts">
import type { SeriesView, PaginatedResponse } from "@repo/common";

const { locale } = useI18n();
const { getAll } = useSeriesApi();
const { currentPage, totalItems, totalPages, loading, fetchError } =
  useSeriesView();

// Responsive columns
const series = ref<SeriesView[]>([]);
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

function unwrap(result: unknown): PaginatedResponse<SeriesView> | null {
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
    });

    const paged = unwrap(raw);
    series.value = (paged?.objects ?? []) as SeriesView[];
    totalItems.value = paged?.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / LIMIT.value));
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    loading.value = false;
    isFirstLoad.value = false;
  }
}

watch(locale, () => {
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
    <SeriesHeader />

    <!-- Grid -->
    <div class="page-container py-8">
      <SeriesGrid :items="series.map((s) => [s, 0])" />
    </div>
  </div>
</template>

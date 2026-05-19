<script setup lang="ts">
import type { SeriesView, PaginatedResponse } from "@repo/common";

const { t, locale } = useI18n();
const { getAll, getSeriesProductions } = useSeriesApi();
const {
  searchQuery,
  currentPage,
  totalItems,
  totalPages,
  loading,
  fetchError,
  fetchSuggestions,
} = useSeriesView();

// Responsive columns
const series = ref<[SeriesView, number][]>([]);
const ROWS_PER_PAGE = 5;
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
      seriesFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        is_suggestion: false,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    const paged = unwrap(raw);
    const seriesList = (paged?.objects ?? []) as SeriesView[];
    totalItems.value = paged?.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / LIMIT.value));

    const counts = await Promise.all(
      seriesList.map((s) =>
        getSeriesProductions(s.id).then((p) => p.data?.totalItems ?? 0),
      ),
    );
    series.value = seriesList.map(
      (s, i) => [s, counts[i]] as [SeriesView, number],
    );
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

watch(currentCols, () => {
  currentPage.value = 0;
  loadPage();
});
watch(currentPage, loadPage, { immediate: false });

onMounted(loadPage);
</script>

<template>
  <div
    class="min-h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <!-- Header -->
    <PageHeader
      :title="t('series.header_title')"
      :description="t('series.header_subtitle')"
    />

    <!-- Search -->
    <div class="w-full border-b border-border bg-background">
      <div class="page-container py-5">
        <div class="h-12">
          <SearchBar
            v-model="searchQuery"
            :fetch-suggestions="fetchSuggestions"
            :limit="15"
            :scroll-limit="5"
            :placeholder="t('searchbar.placeholder')"
          />
        </div>
      </div>
    </div>

    <!-- Grid -->
    <SeriesSkeleton v-if="loading && isFirstLoad" />
    <div v-else class="page-container py-8">
      <!-- Grid Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="flex-1 h-px bg-border" />
        <span class="text-[13px] text-muted-foreground shrink-0">
          {{ totalItems }} {{ t("general.results") }}
        </span>
      </div>

      <!-- Grid itself -->
      <SeriesGrid :items="series" :total-pages="totalPages" />

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <SeriesPageJumper
          :currentPage="currentPage"
          :totalPages="totalPages"
          :loading="loading"
          @go-to-page="currentPage = $event"
        />
        <SeriesPagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :loading="loading"
          @go-to-page="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

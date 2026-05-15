import { ref } from "vue";
/**
 * Shared state for the series.
 * Acts as a lightweight global store for filters and pagination.
 */

import type { SeriesView } from "@repo/common";
import type { SearchSuggestion } from "~/components/SearchBar.vue";

// Filters
const searchQuery = ref("");

// Pagination
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(1);

// Loading state
const loading = ref(false);
const fetchError = ref<Error | null>(null);

export function useSeriesView() {
  const { getAll } = useSeriesApi();
  const { locale } = useI18n();

  async function fetchSuggestions(
    query: string,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const resp = await getAll({
      paginationFilters: { page: 0, limit, descending: true },
      seriesFilters: { title: query, is_suggestion: true },
      languageFilters: { lang: locale.value },
    });

    if (!resp.data?.objects) return [];

    return resp.data.objects.map(
      (s: SeriesView): SearchSuggestion => ({
        display: s.titel || "",
        context: undefined,
        searchValue: s.titel || "",
      }),
    );
  }

  return {
    searchQuery,
    currentPage,
    totalItems,
    totalPages,
    loading,
    fetchError,
    fetchSuggestions,
  };
}

import { ref } from "vue";
/**
 * Shared state for the Prints feature.
 * Acts as a lightweight global store for filters, pagination, and view settings.
 */

import type { PrintItemView, PrintType } from "@repo/common";
import { usePrintApi } from "./usePrintApi";
import type { SearchSuggestion } from "~/types/Search";

// Filters
const searchQuery = ref("");
const activeFilter = ref<PrintType | null>(null);

// Pagination
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(1);

// Loading state
const loading = ref(false);
const fetchError = ref<Error | null>(null);

export function usePrintView() {
  const { getAll } = usePrintApi();
  const { locale } = useI18n();

  /**
   * Custom fetch function for suggestions
   * @param query
   */
  async function fetchSuggestions(
    query: string,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const resp = await getAll({
      paginationFilters: { page: 0, limit: limit, descending: true },
      printItemFilters: {
        title: query,
        type: activeFilter.value ?? undefined,
        is_suggestion: true,
      },
      languageFilters: { lang: locale.value },
    });

    if (!resp.data?.objects) return [];

    return resp.data.objects.map((p: PrintItemView): SearchSuggestion => {
      const title = p.titel || "";
      return {
        display: title,
        context: p.print_type,
        searchValue: title,
      };
    });
  }

  return {
    searchQuery,
    activeFilter,
    currentPage,
    totalItems,
    totalPages,
    loading,
    fetchError,
    fetchSuggestions,
  };
}

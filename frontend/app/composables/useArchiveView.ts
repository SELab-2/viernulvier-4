import { ref, computed } from "vue";
import { getToday } from "~/utils/constants";
import type { ProductionView } from "@repo/common";
import type { SearchSuggestion } from "~/types/Search";
import type { DateFilter } from "~/types/DateFilter";

/**
 * Shared state for the Archive feature.
 * Acts as a lightweight global store for filters, pagination, and view settings.
 */

export type ArchiveViewMode = "grid" | "list";

// UI state
const viewMode = ref<ArchiveViewMode>("grid");

// Filters
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");

const _dateFilter = ref<DateFilter>({});
const dateFilter = computed<DateFilter>({
  get: () => ({
    after: _dateFilter.value.after,
    before: _dateFilter.value.before || getToday(),
  }),
  set: (newValue) => {
    _dateFilter.value = newValue;
  },
});

const tagIds = ref<number[]>([]);

// Pagination
const currentPage = ref(1);
const totalPages = ref(1);

// Data/loading state
const loading = ref(false);
const oldestDate = ref("");
const newestDate = ref(getToday());

export function useArchiveView() {
  const { getAll } = useProductionApi();
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
      productionFilters: {
        titelOrArtist: query,
        is_suggestion: true,
        ...dateFilter.value,
        tag_ids: tagIds.value,
      },
      languageFilters: { lang: locale.value },
    });

    if (!resp.data?.objects) return [];

    const lowerQuery = query.toLowerCase();

    return resp.data.objects.map((p: ProductionView): SearchSuggestion => {
      const title = p.titel || "";
      const artist = p.artist || "";

      // Check if the user's query matched the artist
      if (artist.toLowerCase().includes(lowerQuery)) {
        return {
          display: artist, // "Sarah Bettens"
          context: title || "Artist", // Shows the title on the right, or just "Artist"
          searchValue: artist, // Puts "Sarah Bettens" in the bar when clicked
        };
      }

      // Otherwise, assume it matched the title
      return {
        display: title,
        context: artist || "Title",
        searchValue: title,
      };
    });
  }

  return {
    viewMode,
    searchQuery,
    sortOrder,
    dateFilter,
    tagIds,

    currentPage,
    totalPages,

    loading,
    oldestDate,
    newestDate,

    fetchSuggestions,
  };
}

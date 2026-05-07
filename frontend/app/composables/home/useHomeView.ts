import { SearchAssociation, type SearchSuggestion } from "~/types/Search";
import { usePrintView } from "../media/usePrintView";
import { useBlogView } from "../blogs/useBlogView";
import { useArchiveView } from "../useArchiveView";
import { useCropApi } from "../media/useCropApi";
import type { MediaCrop } from "@repo/common";

export function useHomeView() {
  const {
    searchQuery: productionQuery,
    fetchSuggestions: fetchProductionSuggestions,
  } = useArchiveView();
  const { searchQuery: printQuery, fetchSuggestions: fetchPrintSuggestions } =
    usePrintView();
  const { searchQuery: blogQuery, fetchSuggestions: fetchBlogSuggestions } =
    useBlogView();

  const { getAll: getCrops } = useCropApi();

  /**
   * Custom fetch function for suggestions
   * @param query
   */
  async function fetchSuggestions(
    query: string,
    limit: number,
  ): Promise<SearchSuggestion[]> {
    const [prodRes, printRes, blogRes] = await Promise.all([
      fetchProductionSuggestions(query, limit),
      fetchPrintSuggestions(query, limit),
      fetchBlogSuggestions(query, limit),
    ]);

    const suggestions: SearchSuggestion[] = [
      ...prodRes.map((p: SearchSuggestion) => ({
        ...p,
        context: "production",
        association: SearchAssociation.Production,
      })),
      ...printRes.map((p: SearchSuggestion) => ({
        ...p,
        context: "print",
        association: SearchAssociation.Print,
      })),
      ...blogRes.map((p: SearchSuggestion) => ({
        ...p,
        context: "story",
        association: SearchAssociation.Blog,
      })),
    ];

    const lowerQuery = query.toLowerCase();

    return suggestions.sort((a, b) => {
      const aText = a.display.toLowerCase();
      const bText = b.display.toLowerCase();

      // Tier 1: Exact matches get absolute top priority
      const aExact = aText === lowerQuery;
      const bExact = bText === lowerQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // Tier 2: Items that START with the query come next
      const aStarts = aText.startsWith(lowerQuery);
      const bStarts = bText.startsWith(lowerQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Tier 3: If both match at the same tier, sort by shortest string first.
      // (e.g., "Rosas" beats "Rosas danst Rosas" if query is "Rosa")
      if (aStarts && bStarts) {
        return aText.length - bText.length;
      }

      // Tier 4: Fallback to original order for standard "includes" matches
      return 0;
    });
  }

  function applyProductionSearch(query: string) {
    productionQuery.value = query;
  }

  function applyPrintQuery(query: string) {
    printQuery.value = query;
  }

  function applyBlogQuery(query: string) {
    blogQuery.value = query;
  }

  // Media

  async function fetchRandomImages(): Promise<MediaCrop[]> {
    const res = await getCrops({
      paginationFilters: { limit: 10, page: 0, descending: true },
    });

    const crops: MediaCrop[] = res.data?.objects ?? [];
    return crops;
  }

  return {
    fetchSuggestions,
    applyProductionSearch,
    applyPrintQuery,
    applyBlogQuery,
    fetchRandomImages,
  };
}

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

  /**
   * Applies a query to the productions page.
   */
  function applyProductionSearch(query: string) {
    productionQuery.value = query;
  }

  /**
   * Applies a query to the prints page.
   */
  function applyPrintQuery(query: string) {
    printQuery.value = query;
  }

  /**
   * Applies a query to the blogs page.
   */
  function applyBlogQuery(query: string) {
    blogQuery.value = query;
  }

  // Media

  /**
   * Fetches a single random image from the API.
   */
  async function fetchSingleRandomImage(): Promise<MediaCrop | null> {
    try {
      // Get total items quickly (limit: 1 is highly optimized)
      const totalTest = await getCrops({
        paginationFilters: { limit: 1, page: 0, descending: true },
      });

      const totalCrops: number = totalTest.data?.totalItems ?? 0;
      if (totalCrops === 0) return null;

      // Fetch exactly one random item
      const res = await getCrops({
        paginationFilters: {
          limit: 1,
          page: Math.floor(Math.random() * totalCrops),
          descending: true,
        },
      });

      const crop = res.data?.objects[0] ?? null;
      return crop && crop.url !== "" ? crop : null;
    } catch (error) {
      console.error("Failed to fetch random image:", error);
      return null;
    }
  }

  return {
    fetchSuggestions,
    applyProductionSearch,
    applyPrintQuery,
    applyBlogQuery,
    fetchSingleRandomImage,
  };
}

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useSeriesView } from "../../app/composables/useSeriesView";
import * as useSeriesApiModule from "../../app/composables/useSeriesApi";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { ref } from "vue";

vi.mock("../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

const mockLocale = ref("en");
mockNuxtImport("useI18n", () => () => ({
  locale: mockLocale,
}));

describe("useSeriesView", () => {
  const mockApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(mockApi);
  });

  it("provides refs for series view state", () => {
    const {
      searchQuery,
      currentPage,
      totalItems: _totalItems,
      totalPages: _totalPages,
      loading: _loading,
    } = useSeriesView();
    expect(searchQuery.value).toBe("");
    expect(currentPage.value).toBe(0);
  });

  it("fetches suggestions correctly", async () => {
    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [
          { id: 1, titel: "Series 1" },
          { id: 2, titel: "Series 2" },
        ],
      },
    });

    const { fetchSuggestions } = useSeriesView();
    const suggestions = await fetchSuggestions("test", 5);

    expect(mockApi.getAll).toHaveBeenCalledWith({
      paginationFilters: { page: 0, limit: 5, descending: true },
      seriesFilters: { title: "test", is_suggestion: true },
      languageFilters: { lang: "en" },
    });

    expect(suggestions).toHaveLength(2);
    expect((suggestions[0] as { display: string }).display).toBe("Series 1");
  });

  it("returns empty array if no suggestions found", async () => {
    mockApi.getAll.mockResolvedValue({ data: { objects: [] } });

    const { fetchSuggestions } = useSeriesView();
    const suggestions = await fetchSuggestions("test", 5);

    expect(suggestions).toEqual([]);
  });
});

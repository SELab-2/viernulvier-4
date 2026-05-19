import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ref } from "vue";
import { useArchiveView } from "../../app/composables/useArchiveView";
import * as useProductionApiModule from "../../app/composables/useProductionApi";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

vi.mock("../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

const mockLocale = ref("en");

mockNuxtImport("useI18n", () => {
  return () => ({
    locale: mockLocale,
  });
});

describe("useArchiveView", () => {
  const mockApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(mockApi);

    // Reset shared state since it's global to the module
    const archive = useArchiveView();
    archive.viewMode.value = "grid";
    archive.searchQuery.value = "";
    archive.sortOrder.value = "newest";
    archive.dateFilter.value = {};
    archive.tagIds.value = [];
    archive.currentPage.value = 1;
  });

  it("initializes with default values", () => {
    const { viewMode, searchQuery, sortOrder, currentPage } = useArchiveView();
    expect(viewMode.value).toBe("grid");
    expect(searchQuery.value).toBe("");
    expect(sortOrder.value).toBe("newest");
    expect(currentPage.value).toBe(1);
  });

  it("fetchSuggestions calls productionApi.getAll with correct filters", async () => {
    const { fetchSuggestions, dateFilter, tagIds } = useArchiveView();

    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: "Production 1", artist: "Artist 1" }],
      },
    });

    dateFilter.value = { after: "2020-01-01" };
    tagIds.value = [10];

    const suggestions = await fetchSuggestions("test", 5);

    type ProductionFilterCall = {
      productionFilters: {
        titelOrArtist: string;
        is_suggestion: boolean;
        after?: string;
        tag_ids: number[];
      };
    };
    const calls = mockApi.getAll.mock.calls as unknown as Array<
      [ProductionFilterCall]
    >;
    const filters = calls[0][0];

    expect(filters.productionFilters).toMatchObject({
      titelOrArtist: "test",
      is_suggestion: true,
      after: "2020-01-01",
      tag_ids: [10],
    });

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].display).toBe("Production 1");
  });

  it("matches artist in suggestions if query matches artist", async () => {
    const { fetchSuggestions } = useArchiveView();

    mockApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: "Song A", artist: "Sarah Bettens" }],
      },
    });

    const suggestions = await fetchSuggestions("Sarah", 5);

    expect(suggestions[0].display).toBe("Sarah Bettens");
    expect(suggestions[0].context).toBe("Song A");
  });

  it("dateFilter has default 'before' value of today", () => {
    const { dateFilter } = useArchiveView();
    expect(dateFilter.value.before).toBeDefined();
    expect(dateFilter.value.before).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

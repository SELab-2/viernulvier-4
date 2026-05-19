import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHomeView } from "../../../app/composables/home/useHomeView";
import { ref } from "vue";
import { SearchAssociation } from "../../../app/types/Search";

const mockArchiveView = {
  searchQuery: ref(""),
  fetchSuggestions: vi.fn(),
};
const mockPrintView = {
  searchQuery: ref(""),
  fetchSuggestions: vi.fn(),
};
const mockBlogView = {
  searchQuery: ref(""),
  fetchSuggestions: vi.fn(),
};
const mockCropApi = {
  getAll: vi.fn(),
};

vi.mock("../../../app/composables/useArchiveView", () => ({
  useArchiveView: () => mockArchiveView,
}));
vi.mock("../../../app/composables/media/usePrintView", () => ({
  usePrintView: () => mockPrintView,
}));
vi.mock("../../../app/composables/blogs/useBlogView", () => ({
  useBlogView: () => mockBlogView,
}));
vi.mock("../../../app/composables/media/useCropApi", () => ({
  useCropApi: () => mockCropApi,
}));

describe("useHomeView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArchiveView.searchQuery.value = "";
    mockPrintView.searchQuery.value = "";
    mockBlogView.searchQuery.value = "";
  });

  it("fetchSuggestions aggregates and sorts suggestions correctly", async () => {
    mockArchiveView.fetchSuggestions.mockResolvedValue([
      { display: "Production A" },
      { display: "Exact" },
    ]);
    mockPrintView.fetchSuggestions.mockResolvedValue([{ display: "Print B" }]);
    mockBlogView.fetchSuggestions.mockResolvedValue([{ display: "Blog C" }]);

    const { fetchSuggestions } = useHomeView();
    const suggestions = await fetchSuggestions("exact", 10);

    expect(suggestions).toHaveLength(4);
    // Exact match should be first
    expect(suggestions[0].display).toBe("Exact");
    expect(suggestions[0].context).toBe("production");
    expect(suggestions[0].association).toBe(SearchAssociation.Production);
  });

  it("applyProductionSearch updates productionQuery", () => {
    const { applyProductionSearch } = useHomeView();
    applyProductionSearch("test query");
    expect(mockArchiveView.searchQuery.value).toBe("test query");
  });

  it("applyPrintQuery updates printQuery", () => {
    const { applyPrintQuery } = useHomeView();
    applyPrintQuery("print query");
    expect(mockPrintView.searchQuery.value).toBe("print query");
  });

  it("applyBlogQuery updates blogQuery", () => {
    const { applyBlogQuery } = useHomeView();
    applyBlogQuery("blog query");
    expect(mockBlogView.searchQuery.value).toBe("blog query");
  });

  it("fetchSingleRandomImage returns a crop or null", async () => {
    mockCropApi.getAll.mockResolvedValueOnce({
      data: { totalItems: 10 },
    });
    mockCropApi.getAll.mockResolvedValueOnce({
      data: { objects: [{ id: 1, url: "http://example.com/image.jpg" }] },
    });

    const { fetchSingleRandomImage } = useHomeView();
    const image = await fetchSingleRandomImage();

    expect(image).toEqual({ id: 1, url: "http://example.com/image.jpg" });
    expect(mockCropApi.getAll).toHaveBeenCalledTimes(2);
  });

  it("fetchSingleRandomImage handles empty items", async () => {
    mockCropApi.getAll.mockResolvedValueOnce({
      data: { totalItems: 0 },
    });

    const { fetchSingleRandomImage } = useHomeView();
    const image = await fetchSingleRandomImage();

    expect(image).toBeNull();
  });

  it("fetchSingleRandomImage handles errors", async () => {
    mockCropApi.getAll.mockRejectedValue(new Error("API Error"));

    const { fetchSingleRandomImage } = useHomeView();
    const image = await fetchSingleRandomImage();

    expect(image).toBeNull();
  });
});

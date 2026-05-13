import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSeriesApi } from "../../app/composables/useSeriesApi";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDel = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    del: mockDel,
  }),
}));

// Mock the API_ROUTES constant assuming standard REST structures
vi.mock("~/constants/apiRoutes", () => ({
  API_ROUTES: {
    series: {
      base: "/series",
      byId: (id: number) => `/series/${id}`,
      productions: (id: number) => `/series/${id}/productions`,
      productionById: (seriesId: number, productionId: number) =>
        `/series/${seriesId}/productions/${productionId}`,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSeriesApi", () => {
  it("getAll calls GET /series", () => {
    const { getAll } = useSeriesApi();
    void getAll();
    expect(mockGet).toHaveBeenCalledWith("/series");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useSeriesApi();
    void getAll({
      paginationFilters: { page: 0, limit: 20, descending: true },
      languageFilters: { lang: "nl" },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=20");
    expect(url).toContain("lang=nl");
  });

  it("getById calls GET /series/:id", () => {
    const { getById } = useSeriesApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/series/1");
  });

  it("getById appends lang param", () => {
    const { getById } = useSeriesApi();
    void getById(1, "en");
    expect(mockGet).toHaveBeenCalledWith("/series/1?lang=en");
  });

  it("create calls POST /series with body", () => {
    const { create } = useSeriesApi();
    const body = {
      titel: { nl: "Test Series", en: "Test Series" },
      description: { nl: "Desc", en: "Desc" },
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/series", body);
  });

  it("replace calls PUT /series/:id with body", () => {
    const { replace } = useSeriesApi();
    const body = {
      id: 1,
      titel: { nl: "Updated Series", en: "Updated Series" },
      description: { nl: "Desc", en: "Desc" },
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/series/1", body);
  });

  it("modify calls PATCH /series/:id with body", () => {
    const { modify } = useSeriesApi();
    void modify(1, {
      titel: { nl: "Patched Series", en: "Patched Series" },
    });
    expect(mockPatch).toHaveBeenCalledWith("/series/1", {
      titel: { nl: "Patched Series", en: "Patched Series" },
    });
  });

  it("remove calls DELETE /series/:id", () => {
    const { remove } = useSeriesApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/series/1");
  });

  describe("productions", () => {
    it("getSeriesProductions calls GET /series/:id/productions", () => {
      const { getSeriesProductions } = useSeriesApi();
      void getSeriesProductions(1);
      expect(mockGet).toHaveBeenCalledWith("/series/1/productions");
    });

    it("linkProductionToSeries calls PUT /series/:id/productions/:productionId", () => {
      const { linkProductionToSeries } = useSeriesApi();
      void linkProductionToSeries(1, [2]);
      expect(mockPut).toHaveBeenCalledWith("/series/1/productions", "[2]");
    });

    it("unlinkProductionFromSeries calls DELETE /series/:id/productions/:productionId", () => {
      const { unlinkProductionFromSeries } = useSeriesApi();
      void unlinkProductionFromSeries(1, 2);
      expect(mockDel).toHaveBeenCalledWith("/series/1/productions/2");
    });
  });
});

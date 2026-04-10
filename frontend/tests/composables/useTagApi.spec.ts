import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTagApi } from "../../app/composables/useTagApi";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDel = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    del: mockDel,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useTagApi", () => {
  it("getAll calls GET /tags", () => {
    const { getAll } = useTagApi();
    void getAll();
    expect(mockGet).toHaveBeenCalledWith("/tags");
  });

  it("getAll appends lang query param", () => {
    const { getAll } = useTagApi();
    void getAll({ languageFilters: { lang: "en" } });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("lang=en"));
  });

  it("getAll appends pagination and lang together", () => {
    const { getAll } = useTagApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
      languageFilters: { lang: "nl" },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=10");
    expect(url).toContain("lang=nl");
  });

  it("getById calls GET /tags/:id", () => {
    const { getById } = useTagApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/tags/1");
  });

  it("getById appends lang param", () => {
    const { getById } = useTagApi();
    void getById(1, "nl");
    expect(mockGet).toHaveBeenCalledWith("/tags/1?lang=nl");
  });

  it("create calls POST /tags with body", () => {
    const { create } = useTagApi();
    const body = { tag: { nl: "Theater", en: "Theatre" }, legacy_id: null };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/tags", body);
  });

  it("modify calls PATCH /tags/:id with body", () => {
    const { modify } = useTagApi();
    void modify(1, { tag: { nl: "Dans", en: "Dance" } });
    expect(mockPatch).toHaveBeenCalledWith("/tags/1", {
      tag: { nl: "Dans", en: "Dance" },
    });
  });

  it("remove calls DELETE /tags/:id", () => {
    const { remove } = useTagApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/tags/1");
  });
});

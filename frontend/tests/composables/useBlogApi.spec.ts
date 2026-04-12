import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBlogApi } from "../../app/composables/blogs/useBlogApi";

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useBlogApi", () => {
  it("getAll calls GET /blogs", () => {
    const { getAll } = useBlogApi();
    void getAll();
    expect(mockGet).toHaveBeenCalledWith("/blogs");
  });

  it("getAll appends lang query param", () => {
    const { getAll } = useBlogApi();
    void getAll({ languageFilters: { lang: "en" } });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("lang=en"));
  });

  it("getAll appends pagination and lang together", () => {
    const { getAll } = useBlogApi();
    void getAll({
      paginationFilters: { page: 0, limit: 5, descending: true },
      languageFilters: { lang: "nl" },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=5");
    expect(url).toContain("lang=nl");
    expect(url).toContain("descending=true");
  });

  it("getById calls GET /blogs/:id", () => {
    const { getById } = useBlogApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/blogs/1");
  });

  it("getById appends lang query param", () => {
    const { getById } = useBlogApi();
    void getById(1, "en");
    expect(mockGet).toHaveBeenCalledWith("/blogs/1?lang=en");
  });

  it("create calls POST /blogs with body", () => {
    const { create } = useBlogApi();
    const body = {
      titel: { nl: "Test", en: "Test" },
      description: { nl: "Desc", en: "Desc" },
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/blogs", body);
  });

  it("replace calls PUT /blogs/:id with body", () => {
    const { replace } = useBlogApi();
    const body = {
      id: 1,
      titel: { nl: "Updated", en: "Updated" },
      description: { nl: "Desc", en: "Desc" },
      created_at: "",
      updated_at: "",
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/blogs/1", body);
  });

  it("modify calls PATCH /blogs/:id with body", () => {
    const { modify } = useBlogApi();
    void modify(1, { titel: { nl: "Patched", en: "Patched" } });
    expect(mockPatch).toHaveBeenCalledWith("/blogs/1", {
      titel: { nl: "Patched", en: "Patched" },
    });
  });

  it("remove calls DELETE /blogs/:id", () => {
    const { remove } = useBlogApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/blogs/1");
  });
});

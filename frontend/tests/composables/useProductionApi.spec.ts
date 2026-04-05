import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProductionApi } from "../../app/composables/useProductionApi";

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

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t:      (key: string) => key,
    locale: { value: "nl" },
  }),
  createI18n: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProductionApi", () => {
  it("getAll calls GET /productions", () => {
    const { getAll } = useProductionApi();
    getAll();
    expect(mockGet).toHaveBeenCalledWith("/productions");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useProductionApi();
    getAll({
      paginationFilters: { page: 0, limit: 20, descending: true },
      languageFilters: { lang: "nl" },
    });
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain("page=0");
    expect(url).toContain("limit=20");
    expect(url).toContain("lang=nl");
  });

  it("getById calls GET /productions/:id", () => {
    const { getById } = useProductionApi();
    getById(1);
    expect(mockGet).toHaveBeenCalledWith("/productions/1");
  });

  it("getById appends lang param", () => {
    const { getById } = useProductionApi();
    getById(1, "en");
    expect(mockGet).toHaveBeenCalledWith("/productions/1?lang=en");
  });

  it("create calls POST /productions with body", () => {
    const { create } = useProductionApi();
    const body = {
      titel: { nl: "Test", en: "Test" },
      description1: { nl: "Desc", en: "Desc" },
      description2: null,
      artist: null,
      tagline: null,
      credits: null,
      performer_type: null,
      attendance_mode: null,
      legacy_id: null,
    };
    create(body);
    expect(mockPost).toHaveBeenCalledWith("/productions", body);
  });

  it("replace calls PUT /productions/:id with body", () => {
    const { replace } = useProductionApi();
    const body = {
      id: 1,
      titel: { nl: "Updated", en: "Updated" },
      description1: { nl: "Desc", en: "Desc" },
      description2: null,
      artist: null,
      tagline: null,
      credits: null,
      performer_type: null,
      attendance_mode: null,
      legacy_id: null,
      created_at: null,
      updated_at: null,
    };
    replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/productions/1", body);
  });

  it("modify calls PATCH /productions/:id with body", () => {
    const { modify } = useProductionApi();
    modify(1, { titel: { nl: "Patched", en: "Patched" } });
    expect(mockPatch).toHaveBeenCalledWith("/productions/1", {
      titel: { nl: "Patched", en: "Patched" },
    });
  });

  it("remove calls DELETE /productions/:id", () => {
    const { remove } = useProductionApi();
    remove(1);
    expect(mockDel).toHaveBeenCalledWith("/productions/1");
  });

  describe("tags", () => {
    it("getTags calls GET /productions/:id/tags", () => {
      const { getTags } = useProductionApi();
      getTags(1);
      expect(mockGet).toHaveBeenCalledWith("/productions/1/tags");
    });

    it("getTags appends lang param", () => {
      const { getTags } = useProductionApi();
      getTags(1, "nl");
      expect(mockGet).toHaveBeenCalledWith("/productions/1/tags?lang=nl");
    });

    it("addTag calls PUT /productions/:id/tags/:tagId", () => {
      const { addTag } = useProductionApi();
      addTag(1, 2);
      expect(mockPut).toHaveBeenCalledWith("/productions/1/tags/2", {});
    });

    it("removeTag calls DELETE /productions/:id/tags/:tagId", () => {
      const { removeTag } = useProductionApi();
      removeTag(1, 2);
      expect(mockDel).toHaveBeenCalledWith("/productions/1/tags/2");
    });
  });

  describe("blogs", () => {
    it("getBlogs calls GET /productions/:id/blogs", () => {
      const { getBlogs } = useProductionApi();
      getBlogs(1);
      expect(mockGet).toHaveBeenCalledWith("/productions/1/blogs");
    });

    it("getBlogs appends lang param", () => {
      const { getBlogs } = useProductionApi();
      getBlogs(1, "en");
      expect(mockGet).toHaveBeenCalledWith("/productions/1/blogs?lang=en");
    });

    it("linkBlog calls PUT /productions/:id/blogs/:blogId", () => {
      const { linkBlog } = useProductionApi();
      linkBlog(1, 3);
      expect(mockPut).toHaveBeenCalledWith("/productions/1/blogs/3", {});
    });

    it("unlinkBlog calls DELETE /productions/:id/blogs/:blogId", () => {
      const { unlinkBlog } = useProductionApi();
      unlinkBlog(1, 3);
      expect(mockDel).toHaveBeenCalledWith("/productions/1/blogs/3");
    });
  });
});

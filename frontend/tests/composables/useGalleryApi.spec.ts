import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGalleryApi } from "../../app/composables//media/useGalleryApi";
import { CreateMediaGallery, ReplaceMediaGallery } from "@repo/common";

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

describe("useGalleryApi", () => {
  it("getAll calls GET /media/galleries", () => {
    const { getAll } = useGalleryApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("/media/galleries");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useGalleryApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=10");
  });

  it("getById calls GET /media/galleries/:id", () => {
    const { getById } = useGalleryApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/media/galleries/1");
  });

  it("create calls POST /media/galleries with body", () => {
    const { create } = useGalleryApi();
    const body: CreateMediaGallery = {
      name: "Test Gallery",
      type: "default",
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/media/galleries", body);
  });

  it("replace calls PUT /media/galleries/:id with body", () => {
    const { replace } = useGalleryApi();
    const body: ReplaceMediaGallery = {
      name: "Test Gallery",
      type: "default",
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/media/galleries/1", body);
  });

  it("modify calls PATCH /media/galleries/:id with body", () => {
    const { modify } = useGalleryApi();
    void modify(1, { name: "Modified Gallery" });
    expect(mockPatch).toHaveBeenCalledWith("/media/galleries/1", {
      name: "Modified Gallery",
    });
  });

  it("remove calls DELETE /media/galleries/:id", () => {
    const { remove } = useGalleryApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/media/galleries/1");
  });

  describe("items", () => {
    it("getGalleryItems calls GET /media/galleries/:id/items", () => {
      const { getGalleryItems } = useGalleryApi();
      void getGalleryItems(1);
      expect(mockGet).toHaveBeenCalledWith("/media/galleries/1/items");
    });

    it("linkItemToGallery calls PUT /media/galleries/:id/items/:itemId", () => {
      const { linkItemToGallery } = useGalleryApi();
      void linkItemToGallery(1, 2);
      expect(mockPut).toHaveBeenCalledWith("/media/galleries/1/items/2", {});
    });

    it("unlinkItemFromGallery calls DELETE /media/galleries/:id/items/:itemId", () => {
      const { unlinkItemFromGallery } = useGalleryApi();
      void unlinkItemFromGallery(1, 2);
      expect(mockDel).toHaveBeenCalledWith("/media/galleries/1/items/2");
    });
  });
});

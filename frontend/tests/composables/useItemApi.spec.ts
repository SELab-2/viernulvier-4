import { describe, it, expect, vi, beforeEach } from "vitest";
import { useItemApi } from "../../app/composables/media/useItemApi";
import type { CreateMediaItem, ReplaceMediaItem } from "@repo/common";

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

describe("useItemApi", () => {
  it("getAll calls GET /media/items", () => {
    const { getAll } = useItemApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("/media/items");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useItemApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
      languageFilters: { lang: "en" },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=10");
    expect(url).toContain("lang=en");
  });

  it("getById calls GET /media/items/:id", () => {
    const { getById } = useItemApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/media/items/1");
  });

  it("getById appends lang param", () => {
    const { getById } = useItemApi();
    void getById(1, "nl");
    expect(mockGet).toHaveBeenCalledWith("/media/items/1?lang=nl");
  });

  it("create calls POST /media/items with body", () => {
    const { create } = useItemApi();
    const body: CreateMediaItem = {
      type: "image",
      original_filename: "test.png",
      position: "main",
      width: 1920,
      height: 1080,
      title: { en: "Vid Title", nl: "Vid Title" },
      description: { en: "Vid Desc", nl: "Vid Desc" },
      credits: { en: "Vid Credits", nl: "Vid Credits" },
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/media/items", body);
  });

  it("replace calls PUT /media/items/:id with body", () => {
    const { replace } = useItemApi();
    const body: ReplaceMediaItem = {
      type: "image",
      original_filename: "test.png",
      position: "main",
      width: 1920,
      height: 1080,
      title: { en: "Vid Title", nl: "Vid Title" },
      description: { en: "Vid Desc", nl: "Vid Desc" },
      credits: { en: "Vid Credits", nl: "Vid Credits" },
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/media/items/1", body);
  });

  it("modify calls PATCH /media/items/:id with body", () => {
    const { modify } = useItemApi();
    void modify(1, {
      type: "image",
      original_filename: "test.png",
      position: "main",
      width: 1920,
      height: 1080,
      title: { en: "Vid Title", nl: "Vid Title" },
      description: { en: "Vid Desc", nl: "Vid Desc" },
      credits: { en: "Vid Credits", nl: "Vid Credits" },
    });
    expect(mockPatch).toHaveBeenCalledWith("/media/items/1", {
      type: "image",
      original_filename: "test.png",
      position: "main",
      width: 1920,
      height: 1080,
      title: { en: "Vid Title", nl: "Vid Title" },
      description: { en: "Vid Desc", nl: "Vid Desc" },
      credits: { en: "Vid Credits", nl: "Vid Credits" },
    });
  });

  it("remove calls DELETE /media/items/:id", () => {
    const { remove } = useItemApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/media/items/1");
  });

  describe("crops", () => {
    it("getItemCrops calls GET /media/items/:id/crops", () => {
      const { getItemCrops } = useItemApi();
      void getItemCrops(1);
      expect(mockGet).toHaveBeenCalledWith("/media/items/1/crops");
    });

    it("linkCropToItem calls PUT /media/items/:id/crops/:cropId", () => {
      const { linkCropToItem } = useItemApi();
      void linkCropToItem(1, 2);
      expect(mockPut).toHaveBeenCalledWith("/media/items/1/crops/2", {});
    });

    it("unlinkCropFromItem calls DELETE /media/items/:id/crops/:cropId", () => {
      const { unlinkCropFromItem } = useItemApi();
      void unlinkCropFromItem(1, 2);
      expect(mockDel).toHaveBeenCalledWith("/media/items/1/crops/2");
    });
  });
});

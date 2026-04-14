import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCropApi } from "../../app/composables/media/useCropApi";
import type { CreateMediaCrop, ReplaceMediaCrop } from "@repo/common";

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

describe("useCropApi", () => {
  it("getAll calls GET /media/crops", () => {
    const { getAll } = useCropApi();
    void getAll({ page: 0, limit: 10, descending: true });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("/media/crops");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useCropApi();
    void getAll({ page: 0, limit: 10, descending: true });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=10");
  });

  it("getById calls GET /media/crops/:id", () => {
    const { getById } = useCropApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/media/crops/1");
  });

  it("create calls POST /media/crops with body", () => {
    const { create } = useCropApi();
    const body: CreateMediaCrop = {
      name: "hd_ready",
      url: "https://example.com/crop.jpg",
      item_id: 42,
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/media/crops", body);
  });

  it("replace calls PUT /media/crops/:id with body", () => {
    const { replace } = useCropApi();
    const body: ReplaceMediaCrop = {
      name: "thumbnail",
      url: "https://example.com/thumb.jpg",
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/media/crops/1", body);
  });

  it("modify calls PATCH /media/crops/:id with body", () => {
    const { modify } = useCropApi();
    void modify(1, { name: "mobile" });
    expect(mockPatch).toHaveBeenCalledWith("/media/crops/1", {
      name: "mobile",
    });
  });

  it("remove calls DELETE /media/crops/:id", () => {
    const { remove } = useCropApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/media/crops/1");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePriceApi } from "../../app/composables/usePriceApi";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDel = vi.fn();

vi.mock("~/composables/useApi", () => ({
  useApi: () => ({ get: mockGet, post: mockPost, patch: mockPatch, del: mockDel }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("usePriceApi", () => {
  it("getAll calls GET /prices", () => {
    const { getAll } = usePriceApi();
    getAll();
    expect(mockGet).toHaveBeenCalledWith("/prices");
  });

  it("getAll appends lang query param", () => {
    const { getAll } = usePriceApi();
    getAll(undefined, "nl");
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("lang=nl"));
  });

  it("getAll appends pagination and lang together", () => {
    const { getAll } = usePriceApi();
    getAll({ page: 0, limit: 5 }, "en");
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain("page=0");
    expect(url).toContain("limit=5");
    expect(url).toContain("lang=en");
  });

  it("getById calls GET /prices/:id", () => {
    const { getById } = usePriceApi();
    getById(1);
    expect(mockGet).toHaveBeenCalledWith("/prices/1");
  });

  it("getById appends lang param", () => {
    const { getById } = usePriceApi();
    getById(1, "en");
    expect(mockGet).toHaveBeenCalledWith("/prices/1?lang=en");
  });

  it("create calls POST /prices with body", () => {
    const { create } = usePriceApi();
    const body = { price: 10.0, name: { nl: "Standaard", en: "Standard" }, legacy_id: null };
    create(body);
    expect(mockPost).toHaveBeenCalledWith("/prices", body);
  });

  it("replace calls PATCH /prices/:priceId with body", () => {
    const { replace } = usePriceApi();
    const body = { id: 1, price: 15.0, name: { nl: "Aangepast", en: "Updated" } };
    replace(1, body);
    expect(mockPatch).toHaveBeenCalledWith("/prices/1", body);
  });

  it("remove calls DELETE /prices/:id", () => {
    const { remove } = usePriceApi();
    remove(1);
    expect(mockDel).toHaveBeenCalledWith("/prices/1");
  });
});

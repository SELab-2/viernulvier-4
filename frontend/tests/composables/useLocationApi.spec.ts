import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLocationApi } from "../../app/composables/useLocationApi";

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

describe("useLocationApi", () => {
  it("getAll calls GET /locations", () => {
    const { getAll } = useLocationApi();
    getAll();
    expect(mockGet).toHaveBeenCalledWith("/locations");
  });

  it("getAll appends lang query param", () => {
    const { getAll } = useLocationApi();
    getAll({ languageFilters: { lang: "en" } });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("lang=en"));
  });

  it("getAll appends pagination and lang together", () => {
    const { getAll } = useLocationApi();
    getAll({
      paginationFilters: { page: 1, limit: 20, descending: true },
      languageFilters: { lang: "nl" },
    });
    const url = mockGet.mock.calls[0][0];
    expect(url).toContain("page=1");
    expect(url).toContain("limit=20");
    expect(url).toContain("lang=nl");
  });

  it("getById calls GET /locations/:id", () => {
    const { getById } = useLocationApi();
    getById(1);
    expect(mockGet).toHaveBeenCalledWith("/locations/1");
  });

  it("getById appends lang param", () => {
    const { getById } = useLocationApi();
    getById(1, "nl");
    expect(mockGet).toHaveBeenCalledWith("/locations/1?lang=nl");
  });

  it("create calls POST /locations with body", () => {
    const { create } = useLocationApi();
    const body = { location: { nl: "Gent", en: "Gent" }, legacy_id: null };
    create(body);
    expect(mockPost).toHaveBeenCalledWith("/locations", body);
  });

  it("modify calls PATCH /locations/:id with body", () => {
    const { modify } = useLocationApi();
    modify(1, { location: { nl: "Brugge", en: "Brugge" } });
    expect(mockPatch).toHaveBeenCalledWith("/locations/1", {
      location: { nl: "Brugge", en: "Brugge" },
    });
  });

  it("remove calls DELETE /locations/:id", () => {
    const { remove } = useLocationApi();
    remove(1);
    expect(mockDel).toHaveBeenCalledWith("/locations/1");
  });
});

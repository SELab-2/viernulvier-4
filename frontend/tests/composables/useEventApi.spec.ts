import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEventApi } from "../../app/composables/useEventApi";

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

describe("useEventApi", () => {
  it("getAll calls GET /events", () => {
    const { getAll } = useEventApi();
    void getAll();
    expect(mockGet).toHaveBeenCalledWith("/events");
  });

  it("getAll appends filter query params", () => {
    const { getAll } = useEventApi();
    void getAll({
      paginationFilters: { page: 0, limit: 10, descending: true },
    });
    const url = mockGet.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("limit=10");
  });

  it("getById calls GET /events/:id", () => {
    const { getById } = useEventApi();
    void getById(1);
    expect(mockGet).toHaveBeenCalledWith("/events/1");
  });

  it("create calls POST /events with body", () => {
    const { create } = useEventApi();
    const body = {
      starttime: "2025-01-01T00:00:00Z",
      endtime: null,
      doors_at: null,
      intermission_at: null,
      production_id: 1,
      legacy_id: null,
    };
    void create(body);
    expect(mockPost).toHaveBeenCalledWith("/events", body);
  });

  it("replace calls PUT /events/:id with body", () => {
    const { replace } = useEventApi();
    const body = {
      id: 1,
      starttime: "2025-01-01T00:00:00Z",
      endtime: null,
      doors_at: null,
      intermission_at: null,
      production_id: 1,
      legacy_id: null,
      created_at: "",
      updated_at: "",
    };
    void replace(1, body);
    expect(mockPut).toHaveBeenCalledWith("/events/1", body);
  });

  it("modify calls PATCH /events/:id with body", () => {
    const { modify } = useEventApi();
    void modify(1, { starttime: "2025-06-01T00:00:00Z" });
    expect(mockPatch).toHaveBeenCalledWith("/events/1", {
      starttime: "2025-06-01T00:00:00Z",
    });
  });

  it("remove calls DELETE /events/:id", () => {
    const { remove } = useEventApi();
    void remove(1);
    expect(mockDel).toHaveBeenCalledWith("/events/1");
  });

  describe("location", () => {
    it("getLocation calls GET /events/:id/location", () => {
      const { getLocation } = useEventApi();
      void getLocation(1);
      expect(mockGet).toHaveBeenCalledWith("/events/1/location");
    });

    it("getLocation appends lang param", () => {
      const { getLocation } = useEventApi();
      void getLocation(1, "nl");
      expect(mockGet).toHaveBeenCalledWith("/events/1/location?lang=nl");
    });

    it("linkLocation calls PUT /events/:id/location/:locationId", () => {
      const { linkLocation } = useEventApi();
      void linkLocation(1, 2);
      expect(mockPut).toHaveBeenCalledWith("/events/1/location/2", {});
    });

    it("unlinkLocation calls DELETE /events/:id/location", () => {
      const { unlinkLocation } = useEventApi();
      void unlinkLocation(1);
      expect(mockDel).toHaveBeenCalledWith("/events/1/location");
    });
  });

  describe("prices", () => {
    it("getPrices calls GET /events/:id/prices", () => {
      const { getPrices } = useEventApi();
      void getPrices(1);
      expect(mockGet).toHaveBeenCalledWith("/events/1/prices");
    });

    it("getPrices appends lang param", () => {
      const { getPrices } = useEventApi();
      void getPrices(1, "en");
      expect(mockGet).toHaveBeenCalledWith("/events/1/prices?lang=en");
    });

    it("linkPrice calls PUT /events/:id/prices/:priceId", () => {
      const { linkPrice } = useEventApi();
      void linkPrice(1, 3);
      expect(mockPut).toHaveBeenCalledWith("/events/1/prices/3", {});
    });

    it("unlinkPrice calls DELETE /events/:id/prices/:priceId", () => {
      const { unlinkPrice } = useEventApi();
      void unlinkPrice(1, 3);
      expect(mockDel).toHaveBeenCalledWith("/events/1/prices/3");
    });
  });
});

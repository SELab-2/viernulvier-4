import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * useApi is tested by stubbing the global $fetch — no real HTTP requests are made.
 *
 * Setup:
 * - useAuth is mocked to return a shared mockApiKey object. Setting mockApiKey.value
 *   in a test simulates a logged-in state without re-mocking the module.
 * - useRuntimeConfig is mocked to return a fixed base URL.
 * - $fetch is stubbed globally so calls can be inspected and responses controlled.
 * - beforeEach resets the $fetch mock and clears the api key between tests.
 */

const mockApiKey = { value: null as string | null };
vi.mock("../../app/composables/useAuth", () => ({
  useAuth: () => ({ apiKey: mockApiKey }),
}));

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useRuntimeConfig: () => ({ public: { apiBase: "http://localhost:3000" } }),
  }
});

import { useApi } from "../../app/composables/useApi";

const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

function makeFetchError(status: number, message: string) {
  return Object.assign(new Error(message), { status, data: { message } });
}

beforeEach(() => {
  mockFetch.mockReset();
  mockApiKey.value = null;
});

describe("useApi", () => {
  describe("get", () => {
    it("returns data on a successful GET", async () => {
      mockFetch.mockResolvedValue({ id: 1 });
      const { get } = useApi();
      const result = await get("/test");
      expect(result.data).toEqual({ id: 1 });
      expect(result.error).toBeNull();
      expect(result.status).toBe(200);
    });

    it("calls the correct URL", async () => {
      mockFetch.mockResolvedValue({});
      const { get } = useApi();
      await get("/productions");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/productions",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("returns error on non-ok response", async () => {
      mockFetch.mockRejectedValue(makeFetchError(404, "Not found"));
      const { get } = useApi();
      const result = await get("/test");
      expect(result.data).toBeNull();
      expect(result.error).toBe("Not found");
      expect(result.status).toBe(404);
    });

    it("calls onError when provided and request fails", async () => {
      mockFetch.mockRejectedValue(makeFetchError(403, "Forbidden"));
      const { get } = useApi();
      const onError = vi.fn();
      await get("/test", { onError });
      expect(onError).toHaveBeenCalledWith(403, "Forbidden");
    });

    it("returns error on network failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network down"));
      const { get } = useApi();
      const result = await get("/test");
      expect(result.data).toBeNull();
      expect(result.error).toBe("Network down");
      expect(result.status).toBeNull();
    });

    it("handles null response (204)", async () => {
      mockFetch.mockResolvedValue(null);
      const { get } = useApi();
      const result = await get("/test");
      expect(result.data).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe("post", () => {
    it("sends body as object", async () => {
      mockFetch.mockResolvedValue({ id: 1 });
      const { post } = useApi();
      await post("/test", { name: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/test",
        expect.objectContaining({
          method: "POST",
          body: { name: "test" },
        })
      );
    });
  });

  describe("put", () => {
    it("sends a PUT request", async () => {
      mockFetch.mockResolvedValue({ id: 1 });
      const { put } = useApi();
      await put("/test/1", { id: 1, name: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/test/1",
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  describe("patch", () => {
    it("sends a PATCH request", async () => {
      mockFetch.mockResolvedValue({ id: 1 });
      const { patch } = useApi();
      await patch("/test/1", { name: "patched" });
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/test/1",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  describe("del", () => {
    it("sends a DELETE request", async () => {
      mockFetch.mockResolvedValue(null);
      const { del } = useApi();
      await del("/test/1");
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/test/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("api key header", () => {
    it("attaches x-api-key header when logged in", async () => {
      mockApiKey.value = "test-key";
      mockFetch.mockResolvedValue({});
      const { get } = useApi();
      await get("/test");
      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["x-api-key"]).toBe("test-key");
    });

    it("does not attach x-api-key header when not logged in", async () => {
      mockFetch.mockResolvedValue({});
      const { get } = useApi();
      await get("/test");
      const calledHeaders = mockFetch.mock.calls[0][1].headers;
      expect(calledHeaders["x-api-key"]).toBeUndefined();
    });
  });
});
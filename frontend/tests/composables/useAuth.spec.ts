import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "../../app/composables/useAuth";

vi.mock("#app", () => ({
  useRuntimeConfig: () => ({ public: { apiBase: "http://localhost:3000" } }),
  useState: vi.fn((key: string, init: () => unknown) => ({ value: init() })),
  navigateTo: vi.fn(),
  computed: (fn: () => unknown) => ({ value: fn() }),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe("useAuth", () => {
  describe("login", () => {
    it("returns success and stores key on valid credentials", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            account: { id: 1, username: "admin" },
            apiKey: { id: 1, key: "abc123" },
          }),
      });

      const { login, apiKey, account } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(true);
      expect(apiKey.value).toBe("abc123");
      expect(account.value).toEqual({ id: 1, username: "admin" });
    });

    it("returns error on invalid credentials", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({ account: { id: 1, username: "admin" }, apiKey: null }),
      });

      const { login } = useAuth();
      const result = await login("admin", "wrongpassword");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns error when apiKey is null in response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ account: { id: 1, username: "admin" }, apiKey: null }),
      });

      const { login } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns network error when fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Network down"));

      const { login } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error. Could not reach the server.");
    });

    it("posts to the correct endpoint", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            account: { id: 1, username: "admin" },
            apiKey: { id: 1, key: "abc" },
          }),
      });

      const { login } = useAuth();
      await login("admin", "password");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/login",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("logout", () => {
    it("clears account and apiKey state", () => {
      const { account, apiKey, logout } = useAuth();
      account.value = { id: 1, username: "admin" };
      apiKey.value = "abc123";

      logout();

      expect(account.value).toBeNull();
      expect(apiKey.value).toBeNull();
    });
  });

  describe("rehydrate", () => {
    it("restores state from sessionStorage", () => {
      sessionStorage.setItem("apiKey", "stored-key");
      sessionStorage.setItem("account", JSON.stringify({ id: 1, username: "admin" }));

      const { rehydrate, apiKey, account } = useAuth();
      rehydrate();

      expect(apiKey.value).toBe("stored-key");
      expect(account.value).toEqual({ id: 1, username: "admin" });
    });

    it("does not overwrite existing state", () => {
      const { rehydrate, apiKey } = useAuth();
      apiKey.value = "existing-key";
      sessionStorage.setItem("apiKey", "stored-key");

      rehydrate();

      expect(apiKey.value).toBe("existing-key");
    });
  });
});
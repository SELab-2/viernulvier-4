import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "../../app/composables/useAuth";

vi.mock("#app", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return{
    ...actual,
    useRuntimeConfig: () => ({ public: { apiBase: "http://localhost:3000" } }),
    useState: vi.fn((key: string, init: () => unknown) => ({ value: init() })),
    navigateTo: vi.fn(),
    computed: (fn: () => unknown) => ({ value: fn() }),
  }
});


const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe("useAuth", () => {
  describe("login", () => {
    it("returns success and stores key on valid credentials", async () => {
      mockFetch.mockResolvedValue({
        account: { id: 1, username: "admin" },
        apiKey: { id: 1, key: "abc123" },
      });

      const { login, apiKey, account } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(true);
      expect(apiKey.value).toBe("abc123");
      expect(account.value).toEqual({ id: 1, username: "admin" });
    });

    it("returns error when apiKey is null in response", async () => {
      mockFetch.mockResolvedValue({
        account: { id: 1, username: "admin" },
        apiKey: null,
      });

      const { login } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns error when $fetch throws (invalid credentials)", async () => {
      mockFetch.mockRejectedValue(
        Object.assign(new Error("Unauthorized"), { status: 401 })
      );

      const { login } = useAuth();
      const result = await login("admin", "wrongpassword");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("returns error on network failure", async () => {
      mockFetch.mockRejectedValue(new Error("Network down"));

      const { login } = useAuth();
      const result = await login("admin", "password");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("posts to the correct endpoint", async () => {
      mockFetch.mockResolvedValue({
        account: { id: 1, username: "admin" },
        apiKey: { id: 1, key: "abc" },
      });

      const { login } = useAuth();
      await login("admin", "password");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/auth/login",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("sends username and password in the body", async () => {
      mockFetch.mockResolvedValue({
        account: { id: 1, username: "admin" },
        apiKey: { id: 1, key: "abc" },
      });

      const { login } = useAuth();
      await login("admin", "password");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: { username: "admin", password: "password" },
        })
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
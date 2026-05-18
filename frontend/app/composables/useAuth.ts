import {
  type ApiKey,
  type ChangePassword,
  type PublicAccount,
} from "@repo/common";
import { ROUTES } from "~/utils/routes";
import { FetchError } from "ofetch"; // Nuxt's underlying fetch error type

export interface LoginResponse {
  account: PublicAccount;
  apiKey: ApiKey | null;
}

/**
 * Handles authentication for the admin subdomain.
 * After login, the account and API key are stored in global Nuxt state
 * and persisted in sessionStorage (cleared when the tab is closed).
 *
 * The API key is consumed by useApi to authenticate requests.
 */
export function useAuth() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  const account = useState<PublicAccount | null>("auth.account", () => null);
  const apiKey = useState<string | null>("auth.apiKey", () => null);

  // Track if the keys have been validated by the backend this session
  const isVerified = useState<boolean>("auth.isVerified", () => false);
  const isSuperVerified = useState<boolean>(
    "auth.isSuperVerified",
    () => false,
  );

  /**
   * Restores auth state from sessionStorage after a page refresh.
   * Call this once in app.vue inside onMounted.
   */
  function rehydrate(): void {
    if (import.meta.client && !apiKey.value) {
      const storedKey = sessionStorage.getItem("apiKey");
      const storedAccount = sessionStorage.getItem("account");
      if (storedKey) apiKey.value = storedKey;
      if (storedAccount)
        account.value = JSON.parse(storedAccount) as PublicAccount;
    }
  }

  /**
   * Pings the backend to ensure the current API key is still valid.
   */
  async function verifySession(): Promise<boolean> {
    const currentKey =
      apiKey.value ||
      (import.meta.client ? sessionStorage.getItem("apiKey") : null);

    if (!currentKey) {
      logout();
      return false;
    }

    if (isVerified.value) return true;

    try {
      await $fetch(`${baseUrl}/auth/verify`, {
        method: "GET",
        headers: { "x-api-key": currentKey },
      });

      isVerified.value = true;
      return true;
    } catch {
      console.warn("API Key validation failed. Logging out.");
      logout();
      return false;
    }
  }

  /**
   * Pings the backend to ensure the current API key has super admin privileges.
   */
  async function verifySuperSession(): Promise<boolean> {
    const currentKey =
      apiKey.value ||
      (import.meta.client ? sessionStorage.getItem("apiKey") : null);

    if (!currentKey) {
      logout();
      return false;
    }

    if (isSuperVerified.value) return true;

    try {
      await $fetch(`${baseUrl}/auth/verify-super`, {
        method: "GET",
        headers: { "x-api-key": currentKey },
      });

      isSuperVerified.value = true;
      isVerified.value = true; // If they are super, they are also standard verified
      return true;
    } catch (error) {
      // If error is FetchError, we can check the status code
      if (error instanceof FetchError) {
        if (error.response?.status === 401) {
          // Key is entirely invalid/expired. Nuke the session.
          console.warn("API Key invalid or expired. Logging out.");
          logout();
          return false;
        }
        if (error.response?.status === 403) {
          // Key is valid, but they are NOT a super admin.
          // Do NOT log them out, just deny access.
          console.warn("User lacks super admin privileges.");
          return false;
        }
      }

      // Fallback for network errors, etc.
      return false;
    }
  }

  /**
   * Logs in with username and password via POST /auth/login.
   * On success, stores the account and API key in global state and sessionStorage.
   */
  async function login(
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await $fetch<LoginResponse>(`${baseUrl}/auth/login`, {
        method: "POST",
        body: { username, password },
      });

      if (!data.apiKey) {
        return {
          success: false,
          error: "Invalid credentials or no API key linked to this account.",
        };
      }

      account.value = data.account;
      apiKey.value = data.apiKey.key;

      // Mark as verified immediately upon fresh login
      isVerified.value = true;
      // If the backend says they are super on login, we can trust it for the session
      if (data.account.superAdmin) {
        isSuperVerified.value = true;
      }

      if (import.meta.client) {
        sessionStorage.setItem("apiKey", data.apiKey.key);
        sessionStorage.setItem("account", JSON.stringify(data.account));
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Invalid credentials or no API key linked to this account.",
      };
    }
  }

  /** Clears auth state and redirects to the login page. */
  function logout(): void {
    account.value = null;
    apiKey.value = null;
    isVerified.value = false;
    isSuperVerified.value = false;

    if (import.meta.client) {
      sessionStorage.removeItem("apiKey");
      sessionStorage.removeItem("account");
    }

    void navigateTo(ROUTES.admin.login.base);
  }

  /**
   * POST "/auth/change-password"
   *
   * Changes the password of the current account.
   */
  async function changePassword(
    body: ChangePassword,
  ): Promise<PublicAccount | null> {
    const currentKey =
      apiKey.value ||
      (import.meta.client ? sessionStorage.getItem("apiKey") : null);

    try {
      // We have to do it like this so Nuxt doesn't automatically show an error page.
      // This will not work for some reason with anything else.
      const response = await $fetch(`${baseUrl}/auth/change-password`, {
        method: "POST",
        body: body,
        headers: { "x-api-key": currentKey as string },
      });

      return response as PublicAccount;
    } catch {
      return null;
    }
  }

  const isLoggedIn = computed(() => !!apiKey.value);

  const isSuperAdmin = computed(() => {
    return account.value?.superAdmin === true;
  });

  return {
    account,
    apiKey,
    isLoggedIn,
    isVerified,
    isSuperVerified,
    isSuperAdmin,
    login,
    logout,
    rehydrate,
    verifySession,
    verifySuperSession,
    changePassword,
  };
}

import type { PublicAccount, ApiKey } from "@repo/common";
import { ROUTES } from "../utils/routes";

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
  const baseUrl = config.public.apiBase as string;

  const account = useState<PublicAccount | null>("auth.account", () => null);
  const apiKey = useState<string | null>("auth.apiKey", () => null);

  /**
   * Restores auth state from sessionStorage after a page refresh.
   * Call this once in app.vue inside onMounted.
   */
  function rehydrate(): void {
    if (import.meta.client && !apiKey.value) {
      const storedKey = sessionStorage.getItem("apiKey");
      const storedAccount = sessionStorage.getItem("account");
      if (storedKey) apiKey.value = storedKey;
      if (storedAccount) account.value = JSON.parse(storedAccount);
    }
  }

  /**
   * Logs in with username and password via POST /auth/login.
   * On success, stores the account and API key in global state and sessionStorage.
   */
  async function login(
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok || !data.apiKey) {
        return {
          success: false,
          error: "Invalid credentials or no API key linked to this account.",
        };
      }

      account.value = data.account;
      apiKey.value = data.apiKey.key;

      if (import.meta.client) {
        sessionStorage.setItem("apiKey", data.apiKey.key);
        sessionStorage.setItem("account", JSON.stringify(data.account));
      }

      return { success: true };
    } catch {
      return {
        success: false,
        error: "Network error. Could not reach the server.",
      };
    }
  }

  /** Clears auth state and redirects to the login page. */
  function logout(): void {
    account.value = null;
    apiKey.value = null;
    if (import.meta.client) {
      sessionStorage.removeItem("apiKey");
      sessionStorage.removeItem("account");
    }
    navigateTo(ROUTES.login.base);
  }

  const isLoggedIn = computed(() => !!apiKey.value);

  return { account, apiKey, isLoggedIn, login, logout, rehydrate };
}
/**
 * Base composable for all HTTP communication with the backend.
 * Not used directly in pages or components — use the specific composables instead (e.g. useProductionApi).
 *
 * Automatically attaches the x-api-key header when the user is logged in.
 * Reads the base URL from runtimeConfig (NUXT_API_BASE in .env).
 * Uses Nuxt's $fetch (ofetch) instead of native fetch for automatic JSON parsing and better error handling.
 */

export interface ApiOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  /** Override the default error handling for this specific request. */
  onError?: (status: number, message: string) => void;
}

export interface ApiResponse<TData> {
  data: TData | null;
  error: string | null;
  errorCode?: string | null;
  errorData?: unknown;
  status: number | null;
}

export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;
  const { apiKey } = useAuth();

  async function request<TData, TBody = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    options: ApiOptions<TBody> = {},
  ): Promise<ApiResponse<TData>> {
    const { body, headers: extraHeaders, onError } = options;

    const headers: Record<string, string> = {
      ...(apiKey.value ? { "x-api-key": apiKey.value } : {}),
      ...extraHeaders,
    };

    try {
      const data = await $fetch<TData>(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? body : undefined,
      });

      return { data: data ?? null, error: null, errorCode: null, status: 200 };
    } catch (err: unknown) {
      // $fetch throws a FetchError on non-ok responses with status and data attached
      const fetchError = err as {
        status?: number;
        data?: { message?: string; internalCode?: string } & Record<
          string,
          unknown
        >;
        message?: string;
      };
      const status = fetchError.status ?? null;
      const errorCode = fetchError.data?.internalCode ?? null;
      const errorData = fetchError.data ?? null;
      const message =
        fetchError.data?.message ??
        fetchError.message ??
        "An unexpected network error occurred.";

      if (onError) {
        onError(status ?? 0, message);
      } else {
        handleDefaultError(status ?? 0, message);
      }

      return { data: null, error: message, errorCode, errorData, status };
    }
  }

  /**
   * Fallback error handler used when no onError is passed to a request.
   * 401/403 are logged as auth errors — redirect to login should be handled
   * by the caller via onError if needed.
   */
  function handleDefaultError(status: number, message: string): void {
    if (status === 401 || status === 403) {
      console.error(`[useApi] Auth error (${status}): ${message}`);
    } else if (status === 404) {
      console.warn(`[useApi] Not found (404): ${message}`);
    } else if (status === 0) {
      console.error(`[useApi] Network error: ${message}`);
    } else {
      console.error(`[useApi] Error (${status}): ${message}`);
    }
  }

  /** request — asks for object. */
  function get<TData>(
    endpoint: string,
    options?: Omit<ApiOptions<never>, "body">,
  ): Promise<ApiResponse<TData>> {
    return request<TData>("GET", endpoint, options);
  }

  /** creation — creates an object. */
  function post<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">,
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("POST", endpoint, { ...options, body });
  }

  /** Full replace — sends the entire object. */
  function put<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">,
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("PUT", endpoint, { ...options, body });
  }

  /** Partial update — only sends the fields that need to change. */
  function patch<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">,
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("PATCH", endpoint, { ...options, body });
  }

  /** deletion — removes the object. */
  function del<TData>(
    endpoint: string,
    options?: Omit<ApiOptions<never>, "body">,
  ): Promise<ApiResponse<TData>> {
    return request<TData>("DELETE", endpoint, options);
  }

  return { get, post, put, patch, del };
}

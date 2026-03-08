import { useAuth } from "./useAuth";

export interface ApiOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
  /** Override the default error handling for this specific request. */
  onError?: (status: number, message: string) => void;
}

export interface ApiResponse<TData> {
  data: TData | null;
  error: string | null;
  status: number | null;
}

export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase as string;
  const { apiKey } = useAuth();

  /**
   * Base fetch wrapper used by all method helpers.
   * Attaches the x-api-key header when the user is logged in.
   * On non-ok responses, calls onError if provided, otherwise falls back to handleDefaultError.
   */
  async function request<TData, TBody = unknown>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    endpoint: string,
    options: ApiOptions<TBody> = {}
  ): Promise<ApiResponse<TData>> {
    const { body, headers: extraHeaders, onError } = options;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(apiKey.value ? { "x-api-key": apiKey.value } : {}),
      ...extraHeaders,
    };

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await response.text();
      const data: TData | null = text ? (JSON.parse(text) as TData) : null;

      if (!response.ok) {
        const message =
          (data as { message?: string } | null)?.message ??
          `Request failed with status ${response.status}`;

        onError ? onError(response.status, message) : handleDefaultError(response.status, message);

        return { data: null, error: message, status: response.status };
      }

      return { data, error: null, status: response.status };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected network error occurred.";

      onError ? onError(0, message) : handleDefaultError(0, message);

      return { data: null, error: message, status: null };
    }
  }

  /**
   * Fallback error handler used when no onError is passed to a request.
   * Redirects to /login on 401/403.
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

  function get<TData>(
    endpoint: string,
    options?: Omit<ApiOptions<never>, "body">
  ): Promise<ApiResponse<TData>> {
    return request<TData>("GET", endpoint, options);
  }

  function post<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("POST", endpoint, { ...options, body });
  }

  function put<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("PUT", endpoint, { ...options, body });
  }

  function patch<TData, TBody = unknown>(
    endpoint: string,
    body: TBody,
    options?: Omit<ApiOptions<TBody>, "body">
  ): Promise<ApiResponse<TData>> {
    return request<TData, TBody>("PATCH", endpoint, { ...options, body });
  }

  function del<TData>(
    endpoint: string,
    options?: Omit<ApiOptions<never>, "body">
  ): Promise<ApiResponse<TData>> {
    return request<TData>("DELETE", endpoint, options);
  }

  return { get, post, put, patch, del };
}
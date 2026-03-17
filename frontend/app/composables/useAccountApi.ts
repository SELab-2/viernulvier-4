import type {
  PublicAccount,
  CreateAccount,
  UpdateAccount,
  PaginationFilter,
  PaginatedResponse,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for account management endpoints.
 * All endpoints require a super admin API key.
 */
export function useAccountApi() {
  const { get, post, patch, del } = useApi();

  /** GET /auth — returns a paginated list of accounts. */
  const getAll = (pagination?: Partial<PaginationFilter>) => {
    const query = pagination ? "?" + new URLSearchParams(pagination as Record<string, string>).toString() : "";
    return get<PaginatedResponse<PublicAccount>>(`${API_ROUTES.auth.base}${query}`);
  };

  /** POST /auth — creates a new account. */
  const create = (body: CreateAccount) =>
    post<PublicAccount, CreateAccount>(API_ROUTES.auth.base, body);

  /** PATCH /auth — updates an existing account. The ID must be included in the body. */
  const modify = (body: UpdateAccount) =>
    patch<PublicAccount, UpdateAccount>(API_ROUTES.auth.base, body);

  /** DELETE /auth/:accountId — deletes an account. */
  const remove = (accountId: number) =>
    del(API_ROUTES.auth.byId(accountId));

  return { getAll, create, modify, remove };
}

import type {
  PublicAccount,
  CreateAccount,
  UpdateAccount,
  PaginationFilter,
  PaginatedResponse,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface AccountListOptions {
  paginationFilters?: PaginationFilter;
}

/**
 * Composable for account management endpoints.
 * All endpoints require a super admin API key.
 */
export function useAccountApi() {
  const { get, post, patch, del } = useApi();

  /**
   * GET "/auth{filters}"
   *
   * Returns a paginated list of accounts.
   */
  function getAll({ paginationFilters }: AccountListOptions = {}) {
    const params = { ...paginationFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<PublicAccount>>(
      `${API_ROUTES.auth.base}${query}`,
    );
  }

  /**
   * POST "/auth"
   *
   * Creates a new account.
   */
  function create(body: CreateAccount) {
    return post<PublicAccount, CreateAccount>(API_ROUTES.auth.base, body);
  }

  /**
   * PATCH "/auth"
   *
   * Updates an existing account. The ID must be included in the body.
   */
  function modify(body: UpdateAccount) {
    return patch<PublicAccount, UpdateAccount>(API_ROUTES.auth.base, body);
  }

  /**
   * DELETE "/auth/:accountId"
   *
   * Deletes an account.
   */
  function remove(accountId: number) {
    return del(API_ROUTES.auth.byId(accountId));
  }

  return {
    getAll,
    create,
    modify,
    remove,
  };
}

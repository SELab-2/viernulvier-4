import type {
  Price,
  PriceView,
  CreatePrice,
  ModifyPrice,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
  ReplacePrice,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface PriceListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Composable for price endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function usePriceApi() {
  const { get, post, put, patch, del } = useApi();

  /**
   * GET "/prices{filters}"
   *
   * Returns a paginated list of prices.
   * Returns View objects if a language is passed, otherwise standard Price objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
  }): Promise<ApiResponse<PaginatedResponse<Price>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<PriceView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
  }: PriceListOptions = {}) {
    const params = { ...paginationFilters, ...languageFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Price | PriceView>>(
      `${API_ROUTES.prices.base}${query}`,
    );
  }

  /**
   * GET "/prices/:priceId"
   *
   * Returns a single price.
   * Returns a View object if a language is passed, otherwise a standard Price object.
   */
  function getById(priceId: number): Promise<ApiResponse<Price>>;
  function getById(
    priceId: number,
    lang: Language,
  ): Promise<ApiResponse<PriceView>>;
  function getById(priceId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Price | PriceView>(`${API_ROUTES.prices.byId(priceId)}${query}`);
  }

  /**
   * POST "/prices"
   *
   * Creates a new price.
   */
  function create(body: CreatePrice) {
    return post<Price, CreatePrice>(API_ROUTES.prices.base, body);
  }

  /**
   * PUT "/prices/:priceId"
   *
   * Replaces an existing price.
   */
  function replace(priceId: number, body: ReplacePrice) {
    return put<Price, ReplacePrice>(API_ROUTES.prices.byId(priceId), body);
  }

  /**
   * PATCH "/prices/:priceId"
   *
   * Modifies an existing price.
   */
  function modify(priceId: number, body: ModifyPrice) {
    return patch<Price, ModifyPrice>(API_ROUTES.prices.byId(priceId), body);
  }

  /**
   * DELETE "/prices/:priceId"
   *
   * Deletes a price.
   */
  function remove(priceId: number) {
    return del(API_ROUTES.prices.byId(priceId));
  }

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
  };
}

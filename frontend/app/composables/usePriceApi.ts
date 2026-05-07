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
import { API_ROUTES } from "../utils/apiRoutes";

interface PriceListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Composable for price endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 *
 * Pass a `lang` code to receive a flattened string value (PriceView) instead of
 * the full localized object (Price). Without a lang, the raw localized object is returned.
 */
export function usePriceApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /prices — returns a paginated list of prices. */
  const getAll = ({
    paginationFilters,
    languageFilters,
  }: PriceListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Price | PriceView>>(
      `${API_ROUTES.prices.base}${query}`,
    );
  };

  /** GET /prices/:priceId — returns a single price. */
  const getById = (priceId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Price | PriceView>(`${API_ROUTES.prices.byId(priceId)}${query}`);
  };

  /** POST /prices — creates a new price. */
  const create = (body: CreatePrice) =>
    post<Price, CreatePrice>(API_ROUTES.prices.base, body);

  /**
   * PUT /prices/:priceId - replaces an existing price.
   */
  const replace = (priceId: number, body: ReplacePrice) =>
    put<Price, ReplacePrice>(API_ROUTES.prices.byId(priceId), body);

  /**
   * PATCH /prices/:priceId — modifies an existing price.
   */
  const modify = (priceId: number, body: ModifyPrice) =>
    patch<Price, ModifyPrice>(API_ROUTES.prices.byId(priceId), body);

  /** DELETE /prices/:priceId — deletes a price. */
  const remove = (priceId: number) => del(API_ROUTES.prices.byId(priceId));

  return { getAll, getById, create, replace, modify, remove };
}

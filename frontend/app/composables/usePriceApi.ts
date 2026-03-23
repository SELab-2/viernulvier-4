import type {
  Price,
  PriceView,
  CreatePrice,
  UpdatePrice,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
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
  const { get, post, patch, del } = useApi();

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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const query =
      "?" +
      new URLSearchParams(cleanParams as Record<string, string>).toString();

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
   * PATCH /prices/:priceId — fully replaces an existing price.
   */
  const replace = (priceId: number, body: UpdatePrice) =>
    patch<Price, UpdatePrice>(API_ROUTES.prices.byId(priceId), body);

  /** DELETE /prices/:priceId — deletes a price. */
  const remove = (priceId: number) => del(API_ROUTES.prices.byId(priceId));

  return { getAll, getById, create, replace, remove };
}

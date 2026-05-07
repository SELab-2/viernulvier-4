import type {
  Location,
  LocationView,
  CreateLocation,
  ModifyLocation,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
  FilterLocation,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

interface LocationListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  locationFilters?: FilterLocation;
}

/**
 * Composable for location endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 *
 * Pass a `lang` code to receive a flattened string value (LocationView) instead of
 * the full localized object (Location). Without a lang, the raw localized object is returned.
 */
export function useLocationApi() {
  const { get, post, patch, del } = useApi();

  /** GET /locations — returns a paginated list of locations. */
  const getAll = ({
    paginationFilters,
    languageFilters,
    locationFilters,
  }: LocationListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...locationFilters,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Location | LocationView>>(
      `${API_ROUTES.locations.base}${query}`,
    );
  };

  /** GET /locations/:locationId — returns a single location. */
  const getById = (locationId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Location | LocationView>(
      `${API_ROUTES.locations.byId(locationId)}${query}`,
    );
  };

  /** POST /locations — creates a new location. */
  const create = (body: CreateLocation) =>
    post<Location, CreateLocation>(API_ROUTES.locations.base, body);

  /** PATCH /locations — updates an existing location. */
  const modify = (locationId: number, body: ModifyLocation) =>
    patch<Location, ModifyLocation>(
      API_ROUTES.locations.byId(locationId),
      body,
    );

  /** DELETE /locations/:locationId — deletes a location. */
  const remove = (locationId: number) =>
    del(API_ROUTES.locations.byId(locationId));

  return { getAll, getById, create, modify, remove };
}

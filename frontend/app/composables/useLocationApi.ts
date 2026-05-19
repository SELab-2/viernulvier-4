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
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface LocationListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  locationFilters?: FilterLocation;
}

/**
 * Composable for location endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useLocationApi() {
  const { get, post, patch, del } = useApi();

  /**
   * GET "/locations{filters}"
   *
   * Returns a paginated list of locations.
   * Returns View objects if a language is passed, otherwise standard Location objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
    locationFilters?: FilterLocation;
  }): Promise<ApiResponse<PaginatedResponse<Location>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    locationFilters?: FilterLocation;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<LocationView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
    locationFilters,
  }: LocationListOptions = {}) {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...locationFilters,
    };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Location | LocationView>>(
      `${API_ROUTES.locations.base}${query}`,
    );
  }

  /**
   * GET "/locations/:locationId"
   *
   * Returns a single location.
   * Returns a View object if a language is passed, otherwise a standard Location object.
   */
  function getById(locationId: number): Promise<ApiResponse<Location>>;
  function getById(
    locationId: number,
    lang: Language,
  ): Promise<ApiResponse<LocationView>>;
  function getById(locationId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Location | LocationView>(
      `${API_ROUTES.locations.byId(locationId)}${query}`,
    );
  }

  /**
   * POST "/locations"
   *
   * Creates a new location.
   */
  function create(body: CreateLocation) {
    return post<Location, CreateLocation>(API_ROUTES.locations.base, body);
  }

  /**
   * PATCH "/locations/:locationId"
   *
   * Updates an existing location.
   */
  function modify(locationId: number, body: ModifyLocation) {
    return patch<Location, ModifyLocation>(
      API_ROUTES.locations.byId(locationId),
      body,
    );
  }

  /**
   * DELETE "/locations/:locationId"
   *
   * Deletes a location.
   */
  function remove(locationId: number) {
    return del(API_ROUTES.locations.byId(locationId));
  }

  return {
    getAll,
    getById,
    create,
    modify,
    remove,
  };
}

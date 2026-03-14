import type {
  Location,
  LocationView,
  CreateLocation,
  UpdateLocation,
  Language,
  PaginationFilter,
  PaginatedResponse,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

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
  const getAll = (pagination?: Partial<PaginationFilter>, lang?: Language) => {
    const params = { ...pagination, ...(lang ? { lang } : {}) };
    const query = Object.keys(params).length ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return get<PaginatedResponse & { objects: Location[] | LocationView[] }>(`${API_ROUTES.locations.base}${query}`);
  };

  /** GET /locations/:locationId — returns a single location. */
  const getById = (locationId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Location | LocationView>(`${API_ROUTES.locations.byId(locationId)}${query}`);
  };

  /** POST /locations — creates a new location. */
  const create = (body: CreateLocation) =>
    post<Location, CreateLocation>(API_ROUTES.locations.base, body);

  /** PATCH /locations — updates an existing location. The ID must be included in the body. */
  const modify = (body: UpdateLocation) =>
    patch<Location, UpdateLocation>(API_ROUTES.locations.base, body);

  /** DELETE /locations/:locationId — deletes a location. */
  const remove = (locationId: number) =>
    del(API_ROUTES.locations.byId(locationId));

  return { getAll, getById, create, modify, remove };
}
import type { Location, CreateLocation, UpdateLocation } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for location endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useLocationApi() {
  const { get, post, patch, del } = useApi();

  /** GET /locations — returns all locations. */
  const getAll = () =>
    get<Location[]>(API_ROUTES.locations.base);

  /** GET /locations/:locationId — returns a single location. */
  const getById = (locationId: number) =>
    get<Location>(API_ROUTES.locations.byId(locationId));

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
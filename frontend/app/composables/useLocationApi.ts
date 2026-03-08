import type { Location, CreateLocation, UpdateLocation } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useLocationApi() {
  const { get, post, patch, del } = useApi();

  const getAll = () =>
    get<Location[]>(API_ROUTES.locations.base);

  const getById = (locationId: number) =>
    get<Location>(API_ROUTES.locations.byId(locationId));

  const create = (body: CreateLocation) =>
    post<Location, CreateLocation>(API_ROUTES.locations.base, body);

  const modify = (body: UpdateLocation) =>
    patch<Location, UpdateLocation>(API_ROUTES.locations.base, body);

  const remove = (locationId: number) =>
    del(API_ROUTES.locations.byId(locationId));

  return { getAll, getById, create, modify, remove };
}
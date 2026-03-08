import type {
  Event,
  CreateEvent,
  UpdateEvent,
  FilterEvent,
  Location,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useEventApi() {
  const { get, post, put, patch, del } = useApi();

  const getAll = (filters?: Partial<FilterEvent>) =>
    get<Event[]>(API_ROUTES.events.base, {
      headers: filters
        ? { "x-filters": JSON.stringify(filters) }
        : undefined,
    });

  const getById = (eventId: number) =>
    get<Event>(API_ROUTES.events.byId(eventId));

  const create = (body: CreateEvent) =>
    post<Event, CreateEvent>(API_ROUTES.events.base, body);

  const replace = (eventId: number, body: Event) =>
    put<Event, Event>(API_ROUTES.events.byId(eventId), body);

  const modify = (eventId: number, body: UpdateEvent) =>
    patch<Event, UpdateEvent>(API_ROUTES.events.byId(eventId), body);

  const remove = (eventId: number) =>
    del(API_ROUTES.events.byId(eventId));

  // Locations
  const getLocation = (eventId: number) =>
    get<Location>(API_ROUTES.events.locations(eventId));

  const linkLocation = (eventId: number, locationId: number) =>
    put<boolean, Record<string, never>>(API_ROUTES.events.locationById(eventId, locationId), {});

  const unlinkLocation = (eventId: number) =>
    del(API_ROUTES.events.locations(eventId));

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getLocation,
    linkLocation,
    unlinkLocation,
  };
}
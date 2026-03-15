import type {
  Event,
  CreateEvent,
  UpdateEvent,
  FilterEvent,
  Location,
  LocationView,
  Language,
  Price,
  PriceView,
  PaginatedResponse,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for event endpoints, including their related location and prices.
 * getAll, getById, getLocation and getPrices are public. All other endpoints require an API key.
 */
export function useEventApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /events — returns a paginated list of events, optionally filtered. */
  const getAll = (filters?: Partial<FilterEvent>) => {
    const query = filters ? "?" + new URLSearchParams(filters as Record<string, string>).toString() : "";
    return get<PaginatedResponse & { objects: Event[] }>(`${API_ROUTES.events.base}${query}`);
  };

  /** GET /events/:eventId — returns a single event. */
  const getById = (eventId: number) =>
    get<Event>(API_ROUTES.events.byId(eventId));

  /** POST /events — creates a new event. */
  const create = (body: CreateEvent) =>
    post<Event, CreateEvent>(API_ROUTES.events.base, body);

  /** PUT /events/:eventId — fully replaces an existing event. */
  const replace = (eventId: number, body: Event) =>
    put<Event, Event>(API_ROUTES.events.byId(eventId), body);

  /** PATCH /events/:eventId — partially updates an existing event. */
  const modify = (eventId: number, body: UpdateEvent) =>
    patch<Event, UpdateEvent>(API_ROUTES.events.byId(eventId), body);

  /** DELETE /events/:eventId — deletes an event. */
  const remove = (eventId: number) =>
    del(API_ROUTES.events.byId(eventId));

  /** GET /events/:eventId/locations — returns the location linked to an event. */
  const getLocation = (eventId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Location | LocationView>(`${API_ROUTES.events.locations(eventId)}${query}`);
  };

  /** PUT /events/:eventId/locations/:locationId — links a location to an event. */
  const linkLocation = (eventId: number, locationId: number) =>
    put<boolean, Record<string, never>>(API_ROUTES.events.locationById(eventId, locationId), {});

  /** DELETE /events/:eventId/locations — removes the location from an event. */
  const unlinkLocation = (eventId: number) =>
    del(API_ROUTES.events.locations(eventId));

  /** GET /events/:eventId/prices — returns all prices linked to an event. */
  const getPrices = (eventId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Price[] | PriceView[]>(`${API_ROUTES.events.prices(eventId)}${query}`);
  };

  /** PUT /events/:eventId/prices/:priceId — links a price to an event. */
  const linkPrice = (eventId: number, priceId: number) =>
    put<boolean, Record<string, never>>(API_ROUTES.events.priceById(eventId, priceId), {});

  /** DELETE /events/:eventId/prices/:priceId — removes a price from an event. */
  const unlinkPrice = (eventId: number, priceId: number) =>
    del(API_ROUTES.events.priceById(eventId, priceId));

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
    getPrices,
    linkPrice,
    unlinkPrice,
  };
}
import type {
  Event,
  CreateEvent,
  ModifyEvent,
  FilterEvent,
  Location,
  LocationView,
  Language,
  Price,
  PriceView,
  PaginatedResponse,
  PaginationFilter,
  ReplaceEvent,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface EventListOptions {
  eventFilters?: FilterEvent;
  paginationFilters?: PaginationFilter;
}

/**
 * Composable for event endpoints, including their related location and prices.
 * getAll, getById, getLocation and getPrices are public. All other endpoints require an API key.
 */
export function useEventApi() {
  const { get, post, put, patch, del } = useApi();

  /**
   * GET "/events{filters}"
   *
   * Returns a paginated list of events, optionally filtered.
   */
  function getAll({ eventFilters, paginationFilters }: EventListOptions = {}) {
    const params = { ...eventFilters, ...paginationFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Event>>(`${API_ROUTES.events.base}${query}`);
  }

  /**
   * GET "/events/:eventId"
   *
   * Returns a single event.
   */
  function getById(eventId: number) {
    return get<Event>(API_ROUTES.events.byId(eventId));
  }

  /**
   * POST "/events"
   *
   * Creates a new event.
   */
  function create(body: CreateEvent) {
    return post<Event, CreateEvent>(API_ROUTES.events.base, body);
  }

  /**
   * PUT "/events/:eventId"
   *
   * Fully replaces an existing event.
   */
  function replace(eventId: number, body: ReplaceEvent) {
    return put<Event, ReplaceEvent>(API_ROUTES.events.byId(eventId), body);
  }

  /**
   * PATCH "/events/:eventId"
   *
   * Partially updates an existing event.
   */
  function modify(eventId: number, body: ModifyEvent) {
    return patch<Event, ModifyEvent>(API_ROUTES.events.byId(eventId), body);
  }

  /**
   * DELETE "/events/:eventId"
   *
   * Deletes an event.
   */
  function remove(eventId: number) {
    return del(API_ROUTES.events.byId(eventId));
  }

  /**
   * GET "/events/:eventId/locations"
   *
   * Returns the location linked to an event.
   * Returns a View object if a language is passed, otherwise a standard Location object.
   */
  function getLocation(eventId: number): Promise<ApiResponse<Location>>;
  function getLocation(
    eventId: number,
    lang: Language,
  ): Promise<ApiResponse<LocationView>>;
  function getLocation(eventId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Location | LocationView>(
      `${API_ROUTES.events.locations(eventId)}${query}`,
    );
  }

  /**
   * PUT "/events/:eventId/locations/:locationId"
   *
   * Links a location to an event.
   */
  function linkLocation(eventId: number, locationId: number) {
    return put<boolean, Record<string, never>>(
      API_ROUTES.events.locationById(eventId, locationId),
      {},
    );
  }

  /**
   * DELETE "/events/:eventId/locations"
   *
   * Removes the location from an event.
   */
  function unlinkLocation(eventId: number) {
    return del(API_ROUTES.events.locations(eventId));
  }

  /**
   * GET "/events/:eventId/prices"
   *
   * Returns all prices linked to an event.
   * Returns View objects if a language is passed, otherwise standard Price objects.
   */
  function getPrices(eventId: number): Promise<ApiResponse<Price[]>>;
  function getPrices(
    eventId: number,
    lang: Language,
  ): Promise<ApiResponse<PriceView[]>>;
  function getPrices(eventId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Price[] | PriceView[]>(
      `${API_ROUTES.events.prices(eventId)}${query}`,
    );
  }

  /**
   * PUT "/events/:eventId/prices/:priceId"
   *
   * Links a price to an event.
   */
  function linkPrice(eventId: number, priceId: number) {
    return put<boolean, Record<string, never>>(
      API_ROUTES.events.priceById(eventId, priceId),
      {},
    );
  }

  /**
   * DELETE "/events/:eventId/prices/:priceId"
   *
   * Removes a price from an event.
   */
  function unlinkPrice(eventId: number, priceId: number) {
    return del(API_ROUTES.events.priceById(eventId, priceId));
  }

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

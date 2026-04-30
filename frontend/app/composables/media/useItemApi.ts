import type {
  CreateMediaItem,
  Language,
  LanguageQuery,
  MediaCrop,
  MediaItem,
  MediaItemView,
  ModifyMediaItem,
  PaginatedResponse,
  PaginationFilter,
  ReplaceMediaItem,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface MediaItemListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Composable for media items endpoints.
 * All GET requests are public. All other endpoints require an API key.
 */
export function useItemApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * GET "/items{filters}"
   *
   * Returns a paginated list of media items.
   * Returns View objects if a language is passed, otherwise standard Item objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
  }): Promise<ApiResponse<PaginatedResponse<MediaItem>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<MediaItemView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
  }: MediaItemListOptions = {}) {
    const params = { ...paginationFilters, ...languageFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<MediaItem | MediaItemView>>(
      `${API_ROUTES.items.base}${query}`,
    );
  }

  /**
   * GET "/items/:itemId"
   *
   * Get a specific item by its ID.
   * Returns a View object if a language is passed, otherwise a standard Item object.
   */
  function getById(itemId: number): Promise<ApiResponse<MediaItem>>;
  function getById(
    itemId: number,
    lang: Language,
  ): Promise<ApiResponse<MediaItemView>>;
  function getById(
    itemId: number,
    lang?: Language,
  ): Promise<ApiResponse<MediaItem | MediaItemView>> {
    const query = lang ? `?lang=${lang}` : "";
    return get<MediaItem | MediaItemView>(
      `${API_ROUTES.items.byId(itemId)}${query}`,
    );
  }

  /**
   * POST "/items"
   *
   * Create a new item.
   */
  function create(body: CreateMediaItem) {
    return post<MediaItem, CreateMediaItem>(API_ROUTES.items.base, body);
  }

  /**
   * PUT "/items/:itemId"
   *
   * Replace an existing item.
   */
  function replace(itemId: number, body: ReplaceMediaItem) {
    return put<MediaItem, ReplaceMediaItem>(
      API_ROUTES.items.byId(itemId),
      body,
    );
  }

  /**
   * PATCH "/items/:itemId"
   *
   * Modifies an existing item.
   */
  function modify(itemId: number, body: ModifyMediaItem) {
    return patch<MediaItem, ModifyMediaItem>(
      API_ROUTES.items.byId(itemId),
      body,
    );
  }

  /**
   * DELETE "/items/:itemId"
   *
   * Removes an existing item.
   */
  function remove(itemId: number) {
    return del(API_ROUTES.items.byId(itemId));
  }

  /**
   * -- Crop links.
   */

  /**
   * GET "/items/:itemId/crops"
   *
   * Returns all crops linked to an item.
   */
  function getItemCrops(itemId: number) {
    return get<MediaCrop[]>(API_ROUTES.items.crops(itemId));
  }

  /**
   * PUT "/items/:itemId/crops/:cropId"
   *
   * Links a crop to an item.
   */
  function linkCropToItem(itemId: number, cropId: number) {
    return put(API_ROUTES.items.cropLink(itemId, cropId), {});
  }

  /**
   * DELETE "/items/:itemId/crops/:cropId"
   *
   * Unlinks a crop from an item.
   */
  function unlinkCropFromItem(itemId: number, cropId: number) {
    return del(API_ROUTES.items.cropLink(itemId, cropId));
  }

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getItemCrops,
    linkCropToItem,
    unlinkCropFromItem,
  };
}

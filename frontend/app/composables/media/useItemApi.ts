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

interface MediaItemListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Frontend API calls for media items.
 */
export function useItemApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * Get all media items.
   */
  const getAll = ({
    paginationFilters,
    languageFilters,
  }: MediaItemListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as unknown as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<MediaItem | MediaItemView>>(
      `${API_ROUTES.items.base}${query}`,
    );
  };

  /**
   * Get a specific item by it's ID.
   */
  const getById = (itemId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<MediaItem | MediaItemView>(
      `${API_ROUTES.items.byId(itemId)}${query}`,
    );
  };

  /**
   * Create a new item.
   */
  const create = (body: CreateMediaItem) =>
    post<MediaItem, CreateMediaItem>(API_ROUTES.items.base, body);

  /**
   * Replace an existing item.
   */
  const replace = (itemId: number, body: ReplaceMediaItem) =>
    put<MediaItem, ReplaceMediaItem>(API_ROUTES.items.byId(itemId), body);

  /**
   * Modifies an existing item.
   */
  const modify = (itemId: number, body: ModifyMediaItem) =>
    patch<MediaItem, ModifyMediaItem>(API_ROUTES.items.byId(itemId), body);

  /**
   * Removes an existing item.
   */
  const remove = (itemId: number) => del(API_ROUTES.items.byId(itemId));

  /**
   * -- Crop links.
   */

  /**
   * Returns all crops linked to an item.
   */
  const getItemCrops = (itemId: number) =>
    get<MediaCrop[]>(API_ROUTES.items.crops(itemId));

  /**
   * Links a crop to an item.
   */
  const linkCropToItem = (itemId: number, cropId: number) =>
    put(API_ROUTES.items.cropLink(itemId, cropId), {});

  /**
   * Unlinks a crop from an item.
   */
  const unlinkCropFromItem = (itemId: number, cropId: number) =>
    del(API_ROUTES.items.cropLink(itemId, cropId));

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

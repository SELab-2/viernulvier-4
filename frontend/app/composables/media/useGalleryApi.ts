import type {
  CreateMediaGallery,
  Language,
  MediaGallery,
  MediaItem,
  MediaItemView,
  ModifyMediaGallery,
  PaginatedResponse,
  PaginationFilter,
  PrintItem,
  PrintItemView,
  ReplaceMediaGallery,
} from "@repo/common";

/**
 * Frontend API calls for media and print galleries.
 */
export function useGalleryApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * Get all media galleries.
   */
  const getAll = (paginationFilters: PaginationFilter) => {
    const params = {
      ...paginationFilters,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as unknown as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<MediaGallery>>(
      `${API_ROUTES.galleries.base}${query}`,
    );
  };

  /**
   * Get a specific gallery by it's ID.
   */
  const getById = (galleryId: number) =>
    get<MediaGallery>(API_ROUTES.galleries.byId(galleryId));

  /**
   * Create a new gallery.
   */
  const create = (body: CreateMediaGallery) =>
    post<MediaGallery, CreateMediaGallery>(API_ROUTES.galleries.base, body);

  /**
   * Replace a gallery.
   */
  const replace = (galleryId: number, body: ReplaceMediaGallery) =>
    put<MediaGallery, ReplaceMediaGallery>(
      API_ROUTES.galleries.byId(galleryId),
      body,
    );

  /**
   * Modifies an existing gallery.
   */
  const modify = (galleryId: number, body: ModifyMediaGallery) =>
    patch<MediaGallery, ModifyMediaGallery>(
      API_ROUTES.galleries.byId(galleryId),
      body,
    );

  /**
   * Removes an existing gallery.
   */
  const remove = (galleryId: number) =>
    del(API_ROUTES.galleries.byId(galleryId));

  /**
   * -- Item links.
   */

  /**
   * Returns all items linked to a gallery.
   */
  const getGalleryItems = (galleryId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<MediaItem[] | PrintItem[] | MediaItemView[] | PrintItemView[]>(
      `${API_ROUTES.galleries.items(galleryId)}${query}`,
    );
  };

  /**
   * Links an item to a gallery.
   */
  const linkItemToGallery = (galleryId: number, itemId: number) =>
    put(API_ROUTES.galleries.itemLink(galleryId, itemId), {});

  /**
   * Unlinks an item from a gallery.
   */
  const unlinkItemFromGallery = (galleryId: number, itemId: number) =>
    del(API_ROUTES.galleries.itemLink(galleryId, itemId));

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getGalleryItems,
    linkItemToGallery,
    unlinkItemFromGallery,
  };
}

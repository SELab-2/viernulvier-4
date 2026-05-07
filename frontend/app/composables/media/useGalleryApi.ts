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
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface GalleryListOptions {
  paginationFilters?: PaginationFilter;
}

/**
 * Composable for media galleries endpoints.
 * All GET requests are public. All other endpoints require an API key.
 */
export function useGalleryApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * GET "/galleries{filters}"
   *
   * Returns a paginated list of media galleries.
   */
  function getAll({ paginationFilters }: GalleryListOptions = {}) {
    const params = { ...paginationFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<MediaGallery>>(
      `${API_ROUTES.galleries.base}${query}`,
    );
  }

  /**
   * GET "/galleries/:galleryId"
   *
   * Get a specific gallery by its ID.
   */
  function getById(galleryId: number) {
    return get<MediaGallery>(API_ROUTES.galleries.byId(galleryId));
  }

  /**
   * POST "/galleries"
   *
   * Create a new gallery.
   */
  function create(body: CreateMediaGallery) {
    return post<MediaGallery, CreateMediaGallery>(
      API_ROUTES.galleries.base,
      body,
    );
  }

  /**
   * PUT "/galleries/:galleryId"
   *
   * Replace a gallery.
   */
  function replace(galleryId: number, body: ReplaceMediaGallery) {
    return put<MediaGallery, ReplaceMediaGallery>(
      API_ROUTES.galleries.byId(galleryId),
      body,
    );
  }

  /**
   * PATCH "/galleries/:galleryId"
   *
   * Modifies an existing gallery.
   */
  function modify(galleryId: number, body: ModifyMediaGallery) {
    return patch<MediaGallery, ModifyMediaGallery>(
      API_ROUTES.galleries.byId(galleryId),
      body,
    );
  }

  /**
   * DELETE "/galleries/:galleryId"
   *
   * Removes an existing gallery.
   */
  function remove(galleryId: number) {
    return del(API_ROUTES.galleries.byId(galleryId));
  }

  /**
   * -- Item links.
   */

  /**
   * GET "/galleries/:galleryId/items"
   *
   * Returns all items linked to a gallery.
   * Returns View objects if a language is passed, otherwise standard Item objects.
   */
  function getGalleryItems(
    galleryId: number,
  ): Promise<ApiResponse<MediaItem[] | PrintItem[]>>;
  function getGalleryItems(
    galleryId: number,
    lang: Language,
  ): Promise<ApiResponse<MediaItemView[] | PrintItemView[]>>;
  function getGalleryItems(galleryId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<MediaItem[] | PrintItem[] | MediaItemView[] | PrintItemView[]>(
      `${API_ROUTES.galleries.items(galleryId)}${query}`,
    );
  }

  /**
   * PUT "/galleries/:galleryId/items/:itemId"
   *
   * Links an item to a gallery.
   */
  function linkItemToGallery(galleryId: number, itemId: number) {
    return put(API_ROUTES.galleries.itemLink(galleryId, itemId), {});
  }

  /**
   * DELETE "/galleries/:galleryId/items/:itemId"
   *
   * Unlinks an item from a gallery.
   */
  function unlinkItemFromGallery(galleryId: number, itemId: number) {
    return del(API_ROUTES.galleries.itemLink(galleryId, itemId));
  }

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

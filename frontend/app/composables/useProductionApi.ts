import type {
  Production,
  ProductionView,
  CreateProduction,
  ModifyProduction,
  FilterProduction,
  Tag,
  TagView,
  Blog,
  BlogView,
  Language,
  PaginatedResponse,
  PaginationFilter,
  LanguageQuery,
  ReplaceProduction,
  PrintItem,
  PrintItemView,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import type {
  DefaultGallery,
  GalleryWithItems,
  ItemViewWithCrops,
  ItemWithCrops,
  PrintGallery,
} from "~/utils/galleryFetcher";
import { fetchFullGallery, onGalleryFetchError } from "~/utils/galleryFetcher";
import { buildQueryString } from "~/utils/formatters";

interface ProductionListOptions {
  productionFilters?: FilterProduction;
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Composable for production endpoints, including their related tags and blogs.
 * getAll, getById, getTags and getBlogs are public. All other endpoints require an API key.
 */
export function useProductionApi() {
  const { get, post, put, patch, del } = useApi();

  /**
   * GET "/productions{filters}"
   *
   * Returns a paginated list of productions, optionally filtered.
   * Returns View objects if a language is passed, otherwise standard Production objects.
   */
  function getAll(options?: {
    productionFilters?: FilterProduction;
    paginationFilters?: PaginationFilter;
  }): Promise<ApiResponse<PaginatedResponse<Production>>>;
  function getAll(options: {
    productionFilters?: FilterProduction;
    paginationFilters?: PaginationFilter;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<ProductionView>>>;
  function getAll({
    productionFilters,
    paginationFilters,
    languageFilters,
  }: ProductionListOptions = {}) {
    const params = {
      ...productionFilters,
      ...paginationFilters,
      ...languageFilters,
    };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Production | ProductionView>>(
      `${API_ROUTES.productions.base}${query}`,
    );
  }

  /**
   * GET "/productions/:productionId"
   *
   * Returns a single production.
   */
  function getById(productionId: number): Promise<ApiResponse<Production>>;
  function getById(
    productionId: number,
    lang: Language,
  ): Promise<ApiResponse<ProductionView>>;
  function getById(productionId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Production | ProductionView>(
      `${API_ROUTES.productions.byId(productionId)}${query}`,
    );
  }

  /**
   * POST "/productions"
   *
   * Creates a new production.
   */
  function create(body: CreateProduction) {
    return post<Production, CreateProduction>(
      API_ROUTES.productions.base,
      body,
    );
  }

  /**
   * PUT "/productions/:productionId"
   *
   * Fully replaces an existing production.
   */
  function replace(productionId: number, body: ReplaceProduction) {
    return put<Production, ReplaceProduction>(
      API_ROUTES.productions.byId(productionId),
      body,
    );
  }

  /**
   * PATCH "/productions/:productionId"
   *
   * Partially updates an existing production.
   */
  function modify(productionId: number, body: ModifyProduction) {
    return patch<Production, ModifyProduction>(
      API_ROUTES.productions.byId(productionId),
      body,
    );
  }

  /**
   * DELETE "/productions/:productionId"
   *
   * Deletes a production.
   */
  function remove(productionId: number) {
    return del(API_ROUTES.productions.byId(productionId));
  }

  /**
   * GET "/productions/:productionId/tags"
   *
   * Returns all tags linked to a production.
   */
  function getTags(productionId: number): Promise<ApiResponse<Tag[]>>;
  function getTags(
    productionId: number,
    lang: Language,
  ): Promise<ApiResponse<TagView[]>>;
  function getTags(productionId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Tag[] | TagView[]>(
      `${API_ROUTES.productions.tags(productionId)}${query}`,
    );
  }

  /**
   * PUT "/productions/:productionId/tags/:tagId"
   *
   * Links a tag to a production.
   */
  function addTag(productionId: number, tagId: number) {
    return put<Production, Record<string, never>>(
      API_ROUTES.productions.tagById(productionId, tagId),
      {},
    );
  }

  /**
   * DELETE "/productions/:productionId/tags/:tagId"
   *
   * Removes a tag from a production.
   */
  function removeTag(productionId: number, tagId: number) {
    return del(API_ROUTES.productions.tagById(productionId, tagId));
  }

  /**
   * GET "/productions/:productionId/blogs"
   *
   * Returns all blogs linked to a production.
   */
  function getBlogs(productionId: number): Promise<ApiResponse<Blog[]>>;
  function getBlogs(
    productionId: number,
    lang: Language,
  ): Promise<ApiResponse<BlogView[]>>;
  function getBlogs(productionId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Blog[] | BlogView[]>(
      `${API_ROUTES.productions.blogs(productionId)}${query}`,
    );
  }

  /**
   * PUT "/productions/:productionId/blogs/:blogId"
   *
   * Links a blog to a production.
   */
  function linkBlog(productionId: number, blogId: number) {
    return put<Blog, Record<string, never>>(
      API_ROUTES.productions.blogById(productionId, blogId),
      {},
    );
  }

  /**
   * DELETE "/productions/:productionId/blogs/:blogId"
   *
   * Unlinks a blog from a production.
   */
  function unlinkBlog(productionId: number, blogId: number) {
    return del<Production>(
      API_ROUTES.productions.blogById(productionId, blogId),
    );
  }

  /**
   * Media Galleries
   */

  /**
   * GET "/productions/:productionId/media?type=default"
   *
   * Gets a DefaultGallery from the API.
   */
  function getMediaGallery(
    productionId: number,
  ): Promise<GalleryWithItems<ItemWithCrops> | null>;
  function getMediaGallery(
    productionId: number,
    lang: Language,
  ): Promise<GalleryWithItems<ItemViewWithCrops> | null>;
  async function getMediaGallery(productionId: number, lang?: Language) {
    try {
      const response = await get<DefaultGallery>(
        `${API_ROUTES.productions.media(productionId)}?type=default`,
        { onError: onGalleryFetchError },
      );

      const gallery = response.data;
      if (!gallery) return null;

      return await fetchFullGallery(gallery, lang);
    } catch {
      // We return null because no gallery exists.
      return null;
    }
  }

  /**
   * GET "/productions/:productionId/media?type=prints"
   *
   * Gets a PrintGallery from the API.
   */
  function getPrintsGallery(
    productionId: number,
  ): Promise<GalleryWithItems<PrintItem> | null>;
  function getPrintsGallery(
    productionId: number,
    lang: Language,
  ): Promise<GalleryWithItems<PrintItemView> | null>;
  async function getPrintsGallery(productionId: number, lang?: Language) {
    try {
      const response = await get<PrintGallery>(
        `${API_ROUTES.productions.media(productionId)}?type=prints`,
        { onError: onGalleryFetchError },
      );

      const gallery = response.data;
      if (!gallery) return null;

      return await fetchFullGallery(gallery, lang);
    } catch {
      // We return null because no gallery exists.
      return null;
    }
  }

  /**
   * PUT "/productions/:productionId/media/:galleryId"
   *
   * Links a MediaGallery to a production.
   */
  function linkMedia(productionId: number, galleryId: number) {
    return put(API_ROUTES.productions.mediaById(productionId, galleryId), {});
  }

  /**
   * DELETE "/productions/:productionId/media/:galleryId"
   *
   * Unlinks a MediaGallery from a production.
   */
  function unlinkMedia(productionId: number, galleryId: number) {
    return del(API_ROUTES.productions.mediaById(productionId, galleryId));
  }

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getTags,
    addTag,
    removeTag,
    getBlogs,
    linkBlog,
    unlinkBlog,
    getMediaGallery,
    getPrintsGallery,
    linkMedia,
    unlinkMedia,
  };
}

import type {
  Blog,
  BlogView,
  CreateBlog,
  ModifyBlog,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
  ReplaceBlog,
  FilterBlog,
  PrintItem,
  PrintItemView,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";
import {
  fetchFullGallery,
  onGalleryFetchError,
  type DefaultGallery,
  type GalleryWithItems,
  type ItemViewWithCrops,
  type ItemWithCrops,
  type PrintGallery,
} from "~/utils/galleryFetcher";

interface BlogListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  blogFilters?: FilterBlog;
}

/**
 * Composable for blog endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useBlogApi() {
  const { get, post, put, patch, del } = useApi();

  /**
   * GET "/blogs{filters}"
   *
   * Returns a paginated list of either Blog or BlogView objects depending on
   * whether a language query was passed.
   */

  function getAll(options: {
    paginationFilters: PaginationFilter;
    blogFilters: FilterBlog;
  }): Promise<ApiResponse<PaginatedResponse<Blog>>>;
  function getAll(options: {
    paginationFilters: PaginationFilter;
    blogFilters: FilterBlog;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<BlogView>>>;

  function getAll({
    paginationFilters,
    languageFilters,
    blogFilters,
  }: BlogListOptions = {}) {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...blogFilters,
    };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Blog | BlogView>>(
      `${API_ROUTES.blogs.base}${query}`,
    );
  }

  /**
   * GET "/blogs/:blogId"
   *
   * Returns a Blog or BlogView object depending on
   * whether a language query was passed.
   */

  function getById(blogId: number): Promise<ApiResponse<Blog>>;
  function getById(
    blogId: number,
    lang: Language,
  ): Promise<ApiResponse<BlogView>>;

  function getById(blogId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Blog | BlogView>(`${API_ROUTES.blogs.byId(blogId)}${query}`);
  }

  /**
   * POST "/blogs"
   *
   * Creates a new blog.
   */

  function create(body: CreateBlog) {
    return post<Blog, CreateBlog>(API_ROUTES.blogs.base, body);
  }

  /**
   * PUT "/blogs/:blogId"
   *
   * Replaces an existing blog.
   */

  function replace(blogId: number, body: ReplaceBlog) {
    return put<Blog, ReplaceBlog>(API_ROUTES.blogs.byId(blogId), body);
  }

  /**
   * PATCH "/blogs/:blogId"
   *
   * Modifies an existing blog.
   */

  function modify(blogId: number, body: ModifyBlog) {
    return patch<Blog, ModifyBlog>(API_ROUTES.blogs.byId(blogId), body);
  }

  /**
   * DELETE "/blogs/:blogId"
   *
   * Deletes a blog.
   */

  function remove(blogId: number) {
    return del(API_ROUTES.blogs.byId(blogId));
  }

  /**
   * Media Galleries
   */

  /**
   * GET "/blogs/:blogId/media?type=default"
   *
   * Retrieves the media gallery for a blog. null if none.
   */

  function getMediaGallery(
    blogId: number,
    lang: Language,
  ): Promise<GalleryWithItems<ItemViewWithCrops> | null>;
  function getMediaGallery(
    blogId: number,
  ): Promise<GalleryWithItems<ItemWithCrops> | null>;

  async function getMediaGallery(blogId: number, lang?: Language) {
    try {
      const response = await get<DefaultGallery>(
        `${API_ROUTES.blogs.media(blogId)}?type=default`,
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
   * GET "/blogs/:blogId/media?type=prints"
   *
   * Retrieves the prints gallery for a blog. null if none.
   */

  function getPrintsGallery(
    blogId: number,
  ): Promise<GalleryWithItems<PrintItem> | null>;
  function getPrintsGallery(
    blogId: number,
    lang: Language,
  ): Promise<GalleryWithItems<PrintItemView> | null>;

  async function getPrintsGallery(blogId: number, lang?: Language) {
    try {
      const response = await get<PrintGallery>(
        `${API_ROUTES.blogs.media(blogId)}?type=prints`,
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
   * PUT "/blogs/:blogId/media/:galleryId"
   *
   * Links a specific gallery to this blog.
   */

  function linkMedia(productionId: number, galleryId: number) {
    return put(API_ROUTES.blogs.mediaById(productionId, galleryId), {});
  }

  /**
   * DELETE "/blogs/:blogId/media/:galleryId"
   *
   * Unlinks a specific gallery from this blog.
   */

  function unlinkMedia(productionId: number, galleryId: number) {
    return del(API_ROUTES.blogs.mediaById(productionId, galleryId));
  }

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getMediaGallery,
    getPrintsGallery,
    linkMedia,
    unlinkMedia,
  };
}

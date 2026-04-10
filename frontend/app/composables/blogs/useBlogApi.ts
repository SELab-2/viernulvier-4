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
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import type { DefaultGallery, PrintGallery } from "~/utils/galleryFetcher";

interface BlogListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  blogFilters?: FilterBlog;
}

/**
 * Composable for blog endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 *
 * Pass a `lang` code to receive flattened string values (BlogView) instead of
 * the full localized objects (Blog). Without a lang, the raw localized object is returned.
 */
export function useBlogApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /blogs — returns a paginated list of blogs. */
  const getAll = ({
    paginationFilters,
    languageFilters,
    blogFilters,
  }: BlogListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...blogFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Blog | BlogView>>(
      `${API_ROUTES.blogs.base}${query}`,
    );
  };

  /** GET /blogs/:blogId — returns a single blog. */
  const getById = (blogId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Blog | BlogView>(`${API_ROUTES.blogs.byId(blogId)}${query}`);
  };

  /** POST /blogs — creates a new blog. */
  const create = (body: CreateBlog) =>
    post<Blog, CreateBlog>(API_ROUTES.blogs.base, body);

  /** PUT /blogs/:blogId — fully replaces an existing blog. */
  const replace = (blogId: number, body: ReplaceBlog) =>
    put<Blog, ReplaceBlog>(API_ROUTES.blogs.byId(blogId), body);

  /** PATCH /blogs/:blogId — partially updates an existing blog. */
  const modify = (blogId: number, body: ModifyBlog) =>
    patch<Blog, ModifyBlog>(API_ROUTES.blogs.byId(blogId), body);

  /** DELETE /blogs/:blogId — deletes a blog. */
  const remove = (blogId: number) => del(API_ROUTES.blogs.byId(blogId));

  /**
   * Media Galleries
   */

  /** GET /blogs/:blogId/media?type=default - Retrieves a DefaultGallery from the API. */
  const getMediaGallery = (productionId: number) =>
    get<DefaultGallery>(`${API_ROUTES.blogs.media(productionId)}?type=default`);

  /** GET /blogs/:blogId/media?type=prints - Retrieves a PrintGallery from the API. */
  const getPrintsGallery = (productionId: number) =>
    get<PrintGallery>(`${API_ROUTES.blogs.media(productionId)}?type=prints`);

  /** PUT /blogs/:blogId/media/:galleryId — links a MediaGallery to a blog. */
  const linkMedia = (productionId: number, galleryId: number) =>
    put(API_ROUTES.blogs.mediaById(productionId, galleryId), {});

  /** DELETE /blogs/:blogId/media/:galleryId — unlinks a MediaGallery from a blog. */
  const unlinkMedia = (productionId: number, galleryId: number) =>
    del(API_ROUTES.blogs.mediaById(productionId, galleryId));

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

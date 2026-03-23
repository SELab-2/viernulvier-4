import type {
  Blog,
  BlogView,
  CreateBlog,
  UpdateBlog,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

interface BlogListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
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
  }: BlogListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const query =
      "?" +
      new URLSearchParams(cleanParams as Record<string, string>).toString();

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
  const replace = (blogId: number, body: Blog) =>
    put<Blog, Blog>(API_ROUTES.blogs.byId(blogId), body);

  /** PATCH /blogs/:blogId — partially updates an existing blog. */
  const modify = (blogId: number, body: UpdateBlog) =>
    patch<Blog, UpdateBlog>(API_ROUTES.blogs.byId(blogId), body);

  /** DELETE /blogs/:blogId — deletes a blog. */
  const remove = (blogId: number) => del(API_ROUTES.blogs.byId(blogId));

  return { getAll, getById, create, replace, modify, remove };
}

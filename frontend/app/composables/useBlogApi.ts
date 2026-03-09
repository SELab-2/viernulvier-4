import type { Blog, CreateBlog, UpdateBlog } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for blog endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useBlogApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /blogs — returns all blogs. */
  const getAll = () =>
    get<Blog[]>(API_ROUTES.blogs.base);

  /** GET /blogs/:blogId — returns a single blog. */
  const getById = (blogId: number) =>
    get<Blog>(API_ROUTES.blogs.byId(blogId));

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
  const remove = (blogId: number) =>
    del(API_ROUTES.blogs.byId(blogId));

  return { getAll, getById, create, replace, modify, remove };
}
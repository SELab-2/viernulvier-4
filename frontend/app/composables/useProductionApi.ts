import type {
  Production,
  CreateProduction,
  UpdateProduction,
  FilterProduction,
  Tag,
  Blog,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for production endpoints, including their related tags and blogs.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useProductionApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /productions — returns all productions, optionally filtered. */
  const getAll = (filters?: Partial<FilterProduction>) => {
    const query = filters ? "?" + new URLSearchParams(filters as Record<string, string>).toString() : "";
    return get<Production[]>(`${API_ROUTES.productions.base}${query}`);
  };

  /** GET /productions/:productionId — returns a single production. */
  const getById = (productionId: number) =>
    get<Production>(API_ROUTES.productions.byId(productionId));

  /** POST /productions — creates a new production. */
  const create = (body: CreateProduction) =>
    post<Production, CreateProduction>(API_ROUTES.productions.base, body);

  /** PUT /productions/:productionId — fully replaces an existing production. */
  const replace = (productionId: number, body: Production) =>
    put<Production, Production>(API_ROUTES.productions.byId(productionId), body);

  /** PATCH /productions/:productionId — partially updates an existing production. */
  const modify = (productionId: number, body: UpdateProduction) =>
    patch<Production, UpdateProduction>(API_ROUTES.productions.byId(productionId), body);

  /** DELETE /productions/:productionId — deletes a production. */
  const remove = (productionId: number) =>
    del(API_ROUTES.productions.byId(productionId));

  /** GET /productions/:productionId/tags — returns all tags linked to a production. */
  const getTags = (productionId: number) =>
    get<Tag[]>(API_ROUTES.productions.tags(productionId));

  /** PUT /productions/:productionId/tags/:tagId — links a tag to a production. */
  const addTag = (productionId: number, tagId: number) =>
    put<Production, Record<string, never>>(API_ROUTES.productions.tagById(productionId, tagId), {});

  /** DELETE /productions/:productionId/tags/:tagId — removes a tag from a production. */
  const removeTag = (productionId: number, tagId: number) =>
    del(API_ROUTES.productions.tagById(productionId, tagId));

  /** GET /productions/:productionId/blogs — returns all blogs linked to a production. */
  const getBlogs = (productionId: number) =>
    get<Blog[]>(API_ROUTES.productions.blogs(productionId));

  /** PUT /productions/:productionId/blogs/:blogId — links a blog to a production. */
  const linkBlog = (productionId: number, blogId: number) =>
    put<Blog, Record<string, never>>(API_ROUTES.productions.blogById(productionId, blogId), {});

  /** DELETE /productions/:productionId/blogs/:blogId — unlinks a blog from a production. */
  const unlinkBlog = (productionId: number, blogId: number) =>
    del<Production>(API_ROUTES.productions.blogById(productionId, blogId));

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
  };
}
import type {
  Production,
  CreateProduction,
  UpdateProduction,
  FilterProduction,
  Tag,
  Blog,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useProductionApi() {
  const { get, post, put, patch, del } = useApi();

  const getAll = (filters?: Partial<FilterProduction>) =>
    get<Production[]>(API_ROUTES.productions.base, {
      headers: filters
        ? { "x-filters": JSON.stringify(filters) }
        : undefined,
    });

  const getById = (productionId: number) =>
    get<Production>(API_ROUTES.productions.byId(productionId));

  const create = (body: CreateProduction) =>
    post<Production, CreateProduction>(API_ROUTES.productions.base, body);

  const replace = (productionId: number, body: Production) =>
    put<Production, Production>(API_ROUTES.productions.byId(productionId), body);

  const modify = (productionId: number, body: UpdateProduction) =>
    patch<Production, UpdateProduction>(API_ROUTES.productions.byId(productionId), body);

  const remove = (productionId: number) =>
    del(API_ROUTES.productions.byId(productionId));

  // Tags
  const getTags = (productionId: number) =>
    get<Tag[]>(API_ROUTES.productions.tags(productionId));

  const addTag = (productionId: number, tagId: number) =>
    put<Production, Record<string, never>>(API_ROUTES.productions.tagById(productionId, tagId), {});

  const removeTag = (productionId: number, tagId: number) =>
    del(API_ROUTES.productions.tagById(productionId, tagId));

  // Blogs
  const getBlogs = (productionId: number) =>
    get<Blog[]>(API_ROUTES.productions.blogs(productionId));

  const linkBlog = (productionId: number, blogId: number) =>
    put<Blog, Record<string, never>>(API_ROUTES.productions.blogById(productionId, blogId), {});

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
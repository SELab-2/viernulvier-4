import type { Blog, CreateBlog, UpdateBlog } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useBlogApi() {
  const { get, post, put, patch, del } = useApi();

  const getAll = () =>
    get<Blog[]>(API_ROUTES.blogs.base);

  const getById = (blogId: number) =>
    get<Blog>(API_ROUTES.blogs.byId(blogId));

  const create = (body: CreateBlog) =>
    post<Blog, CreateBlog>(API_ROUTES.blogs.base, body);

  const replace = (blogId: number, body: Blog) =>
    put<Blog, Blog>(API_ROUTES.blogs.byId(blogId), body);

  const modify = (blogId: number, body: UpdateBlog) =>
    patch<Blog, UpdateBlog>(API_ROUTES.blogs.byId(blogId), body);

  const remove = (blogId: number) =>
    del(API_ROUTES.blogs.byId(blogId));

  return { getAll, getById, create, replace, modify, remove };
}
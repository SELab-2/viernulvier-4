import type { Tag, CreateTag, UpdateTag } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

export function useTagApi() {
  const { get, post, patch, del } = useApi();

  const getAll = () =>
    get<Tag[]>(API_ROUTES.tags.base);

  const getById = (tagId: number) =>
    get<Tag>(API_ROUTES.tags.byId(tagId));

  const create = (body: CreateTag) =>
    post<Tag, CreateTag>(API_ROUTES.tags.base, body);

  const modify = (tagId: number, body: UpdateTag) =>
    patch<Tag, UpdateTag>(API_ROUTES.tags.byId(tagId), body);

  const remove = (tagId: number) =>
    del(API_ROUTES.tags.byId(tagId));

  return { getAll, getById, create, modify, remove };
}
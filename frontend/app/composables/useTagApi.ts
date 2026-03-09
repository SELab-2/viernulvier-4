import type { Tag, CreateTag, UpdateTag } from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

/**
 * Composable for tag endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useTagApi() {
  const { get, post, patch, del } = useApi();

  /** GET /tags — returns all tags. */
  const getAll = () =>
    get<Tag[]>(API_ROUTES.tags.base);

  /** GET /tags/:tagId — returns a single tag. */
  const getById = (tagId: number) =>
    get<Tag>(API_ROUTES.tags.byId(tagId));

  /** POST /tags — creates a new tag. */
  const create = (body: CreateTag) =>
    post<Tag, CreateTag>(API_ROUTES.tags.base, body);

  /** PATCH /tags/:tagId — updates an existing tag. */
  const modify = (tagId: number, body: UpdateTag) =>
    patch<Tag, UpdateTag>(API_ROUTES.tags.byId(tagId), body);

  /** DELETE /tags/:tagId — deletes a tag. */
  const remove = (tagId: number) =>
    del(API_ROUTES.tags.byId(tagId));

  return { getAll, getById, create, modify, remove };
}
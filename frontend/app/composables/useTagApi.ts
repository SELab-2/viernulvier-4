import type {
  Tag,
  TagView,
  CreateTag,
  ModifyTag,
  Language,
  PaginationFilter,
  PaginatedResponse,
  LanguageQuery,
  FilterTag,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";

interface TagListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  tagFilters?: FilterTag;
}

/**
 * Composable for tag endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 *
 * Pass a `lang` code to receive a flattened string value (TagView) instead of
 * the full localized object (Tag). Without a lang, the raw localized object is returned.
 */
export function useTagApi() {
  const { get, post, patch, del } = useApi();

  /** GET /tags — returns a paginated list of tags. */
  const getAll = ({
    paginationFilters,
    languageFilters,
    tagFilters,
  }: TagListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...tagFilters,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Tag | TagView>>(
      `${API_ROUTES.tags.base}${query}`,
    );
  };

  /** GET /tags/:tagId — returns a single tag. */
  const getById = (tagId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Tag | TagView>(`${API_ROUTES.tags.byId(tagId)}${query}`);
  };

  /** POST /tags — creates a new tag. */
  const create = (body: CreateTag) =>
    post<Tag, CreateTag>(API_ROUTES.tags.base, body);

  /** PATCH /tags/:tagId — updates an existing tag. */
  const modify = (tagId: number, body: ModifyTag) =>
    patch<Tag, ModifyTag>(API_ROUTES.tags.byId(tagId), body);

  /** DELETE /tags/:tagId — deletes a tag. */
  const remove = (tagId: number) => del(API_ROUTES.tags.byId(tagId));

  return { getAll, getById, create, modify, remove };
}

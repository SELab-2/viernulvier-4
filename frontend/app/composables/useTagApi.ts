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
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface TagListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  tagFilters?: FilterTag;
}

/**
 * Composable for tag endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useTagApi() {
  const { get, post, patch, del } = useApi();

  /**
   * GET "/tags{filters}"
   *
   * Returns a paginated list of tags.
   * Returns View objects if a language is passed, otherwise standard Tag objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
    tagFilters?: FilterTag;
  }): Promise<ApiResponse<PaginatedResponse<Tag>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    tagFilters?: FilterTag;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<TagView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
    tagFilters,
  }: TagListOptions = {}) {
    const params = { ...paginationFilters, ...languageFilters, ...tagFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Tag | TagView>>(
      `${API_ROUTES.tags.base}${query}`,
    );
  }

  /**
   * GET "/tags/:tagId"
   *
   * Returns a single tag.
   * Returns a View object if a language is passed, otherwise a standard Tag object.
   */
  function getById(tagId: number): Promise<ApiResponse<Tag>>;
  function getById(
    tagId: number,
    lang: Language,
  ): Promise<ApiResponse<TagView>>;
  function getById(tagId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Tag | TagView>(`${API_ROUTES.tags.byId(tagId)}${query}`);
  }

  /**
   * POST "/tags"
   *
   * Creates a new tag.
   */
  function create(body: CreateTag) {
    return post<Tag, CreateTag>(API_ROUTES.tags.base, body);
  }

  /**
   * PATCH "/tags/:tagId"
   *
   * Updates an existing tag.
   */
  function modify(tagId: number, body: ModifyTag) {
    return patch<Tag, ModifyTag>(API_ROUTES.tags.byId(tagId), body);
  }

  /**
   * DELETE "/tags/:tagId"
   *
   * Deletes a tag.
   */
  function remove(tagId: number) {
    return del(API_ROUTES.tags.byId(tagId));
  }

  return {
    getAll,
    getById,
    create,
    modify,
    remove,
  };
}

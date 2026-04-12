import type {
  Production,
  ProductionView,
  CreateProduction,
  ModifyProduction,
  FilterProduction,
  Tag,
  TagView,
  Blog,
  BlogView,
  Language,
  PaginatedResponse,
  PaginationFilter,
  LanguageQuery,
  ReplaceProduction,
} from "@repo/common";
import { API_ROUTES } from "../utils/apiRoutes";
import type { DefaultGallery, PrintGallery } from "~/utils/galleryFetcher";

interface ProductionListOptions {
  productionFilters?: FilterProduction;
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Composable for production endpoints, including their related tags and blogs.
 * getAll, getById, getTags and getBlogs are public. All other endpoints require an API key.
 *
 * Pass a `lang` code to receive flattened string values (ProductionView) instead of
 * the full localized objects (Production). Without a lang, the raw localized object is returned.
 */
export function useProductionApi() {
  const { get, post, put, patch, del } = useApi();

  /** GET /productions — returns a paginated list of productions, optionally filtered. */
  const getAll = ({
    productionFilters,
    paginationFilters,
    languageFilters,
  }: ProductionListOptions = {}) => {
    const params = {
      ...productionFilters,
      ...paginationFilters,
      ...languageFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const searchParams = new URLSearchParams();

    Object.entries(cleanParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Production | ProductionView>>(
      `${API_ROUTES.productions.base}${query}`,
    );
  };

  /** GET /productions/:productionId — returns a single production. */
  const getById = (productionId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Production | ProductionView>(
      `${API_ROUTES.productions.byId(productionId)}${query}`,
    );
  };

  /** POST /productions — creates a new production. */
  const create = (body: CreateProduction) =>
    post<Production, CreateProduction>(API_ROUTES.productions.base, body);

  /** PUT /productions/:productionId — fully replaces an existing production. */
  const replace = (productionId: number, body: ReplaceProduction) =>
    put<Production, ReplaceProduction>(
      API_ROUTES.productions.byId(productionId),
      body,
    );

  /** PATCH /productions/:productionId — partially updates an existing production. */
  const modify = (productionId: number, body: ModifyProduction) =>
    patch<Production, ModifyProduction>(
      API_ROUTES.productions.byId(productionId),
      body,
    );

  /** DELETE /productions/:productionId — deletes a production. */
  const remove = (productionId: number) =>
    del(API_ROUTES.productions.byId(productionId));

  /** GET /productions/:productionId/tags — returns all tags linked to a production. */
  const getTags = (productionId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Tag[] | TagView[]>(
      `${API_ROUTES.productions.tags(productionId)}${query}`,
    );
  };

  /** PUT /productions/:productionId/tags/:tagId — links a tag to a production. */
  const addTag = (productionId: number, tagId: number) =>
    put<Production, Record<string, never>>(
      API_ROUTES.productions.tagById(productionId, tagId),
      {},
    );

  /** DELETE /productions/:productionId/tags/:tagId — removes a tag from a production. */
  const removeTag = (productionId: number, tagId: number) =>
    del(API_ROUTES.productions.tagById(productionId, tagId));

  /** GET /productions/:productionId/blogs — returns all blogs linked to a production. */
  const getBlogs = (productionId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Blog[] | BlogView[]>(
      `${API_ROUTES.productions.blogs(productionId)}${query}`,
    );
  };

  /** PUT /productions/:productionId/blogs/:blogId — links a blog to a production. */
  const linkBlog = (productionId: number, blogId: number) =>
    put<Blog, Record<string, never>>(
      API_ROUTES.productions.blogById(productionId, blogId),
      {},
    );

  /** DELETE /productions/:productionId/blogs/:blogId — unlinks a blog from a production. */
  const unlinkBlog = (productionId: number, blogId: number) =>
    del<Production>(API_ROUTES.productions.blogById(productionId, blogId));

  /**
   * Media Galleries
   */

  /** GET /productions/:productionId/media?type=default - Gets a DefaultGallery from the api. */
  const getMediaGallery = (productionId: number) =>
    get<DefaultGallery>(
      `${API_ROUTES.productions.media(productionId)}?type=default`,
    );

  /** GET /productions/:productionId/media?type=prints - Gets a PrintGallery from the api. */
  const getPrintsGallery = (productionId: number) =>
    get<PrintGallery>(
      `${API_ROUTES.productions.media(productionId)}?type=prints`,
    );

  /** PUT /productions/:productionId/media/:galleryId — links a MediaGallery to a production. */
  const linkMedia = (productionId: number, galleryId: number) =>
    put(API_ROUTES.productions.mediaById(productionId, galleryId), {});

  /** DELETE /productions/:productionId/media/:galleryId — unlinks a MediaGallery from a production. */
  const unlinkMedia = (productionId: number, galleryId: number) =>
    del(API_ROUTES.productions.mediaById(productionId, galleryId));

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
    getMediaGallery,
    getPrintsGallery,
    linkMedia,
    unlinkMedia,
  };
}

import type {
  CreateMediaCrop,
  MediaCrop,
  ModifyMediaCrop,
  PaginatedResponse,
  PaginationFilter,
  ReplaceMediaCrop,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface CropListOptions {
  paginationFilters?: PaginationFilter;
}

/**
 * Composable for media crop endpoints.
 * getAll and getById are public. All other endpoints require an API key.
 */
export function useCropApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * GET "/crops{filters}"
   *
   * Returns a paginated list of media crops.
   */

  function getAll({ paginationFilters }: CropListOptions = {}) {
    const params = { ...paginationFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<MediaCrop>>(
      `${API_ROUTES.crops.base}${query}`,
    );
  }

  /**
   * GET "/crops/:cropId"
   *
   * Returns a specific crop by its ID.
   */

  function getById(cropId: number) {
    return get<MediaCrop>(API_ROUTES.crops.byId(cropId));
  }

  /**
   * POST "/crops"
   *
   * Creates a new crop.
   */

  function create(body: CreateMediaCrop) {
    return post<MediaCrop, CreateMediaCrop>(API_ROUTES.crops.base, body);
  }

  /**
   * PUT "/crops/:cropId"
   *
   * Replaces an existing crop.
   */

  function replace(cropId: number, body: ReplaceMediaCrop) {
    return put<MediaCrop, ReplaceMediaCrop>(
      API_ROUTES.crops.byId(cropId),
      body,
    );
  }

  /**
   * PATCH "/crops/:cropId"
   *
   * Modifies an existing crop.
   */

  function modify(cropId: number, body: ModifyMediaCrop) {
    return patch<MediaCrop, ModifyMediaCrop>(
      API_ROUTES.crops.byId(cropId),
      body,
    );
  }

  /**
   * DELETE "/crops/:cropId"
   *
   * Removes an existing crop.
   */

  function remove(cropId: number) {
    return del(API_ROUTES.crops.byId(cropId));
  }

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
  };
}

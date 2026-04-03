import type {
  CreateMediaCrop,
  MediaCrop,
  ModifyMediaCrop,
  PaginatedResponse,
  PaginationFilter,
  ReplaceMediaCrop,
} from "@repo/common";

export function useCropApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * Get all media crops.
   */
  const getAll = (paginationFilters: PaginationFilter) => {
    const params = {
      ...paginationFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as unknown as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<MediaCrop>>(
      `${API_ROUTES.crops.base}${query}`,
    );
  };

  /**
   * Get a specific crop by it's ID.
   */
  const getById = (cropId: number) =>
    get<MediaCrop>(API_ROUTES.crops.byId(cropId));

  /**
   * Create a new crop.
   */
  const create = (body: CreateMediaCrop) =>
    post<MediaCrop, CreateMediaCrop>(API_ROUTES.crops.base, body);

  /**
   * Replace a crop.
   */
  const replace = (cropId: number, body: ReplaceMediaCrop) =>
    put<MediaCrop, ReplaceMediaCrop>(API_ROUTES.crops.byId(cropId), body);

  /**
   * Modifies an existing crop.
   */
  const modify = (cropId: number, body: ModifyMediaCrop) =>
    patch<MediaCrop, ModifyMediaCrop>(API_ROUTES.crops.byId(cropId), body);

  /**
   * Removes an existing crop.
   */
  const remove = (cropId: number) => del(API_ROUTES.crops.byId(cropId));

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
  };
}

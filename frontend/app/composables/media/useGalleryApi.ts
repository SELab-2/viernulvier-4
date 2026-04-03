import type {
  MediaGallery,
  PaginatedResponse,
  PaginationFilter,
} from "@repo/common";

export function useGalleryApi() {
  const { get, post, patch, put, del } = useApi();

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

    return get<PaginatedResponse<MediaGallery>>(
      `${API_ROUTES.galleries.base}${query}`,
    );
  };

  return { getAll };
}

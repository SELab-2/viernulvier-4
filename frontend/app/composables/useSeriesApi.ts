import type {
  CreateSeries,
  Language,
  LanguageQuery,
  ModifySeries,
  PaginatedResponse,
  PaginationFilter,
  Production,
  ProductionView,
  ReplaceSeries,
  Series,
  SeriesView,
} from "@repo/common";

interface SeriesListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Frontend API calls for series.
 */
export function useItemApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * Get all series paginated.
   */
  const getAll = ({
    paginationFilters,
    languageFilters,
  }: SeriesListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as unknown as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<Series | SeriesView>>(
      `${API_ROUTES.series.base}${query}`,
    );
  };

  /**
   * Get a specific series by it's ID.
   */
  const getById = (seriesId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<Series | SeriesView>(
      `${API_ROUTES.series.byId(seriesId)}${query}`,
    );
  };

  /**
   * Create a new series.
   */
  const create = (body: CreateSeries) =>
    post<Series, CreateSeries>(API_ROUTES.series.base, body);

  /**
   * Replace an existing series.
   */
  const replace = (seriesId: number, body: ReplaceSeries) =>
    put<Series, ReplaceSeries>(API_ROUTES.series.byId(seriesId), body);

  /**
   * Modifies an existing series.
   */
  const modify = (seriesId: number, body: ModifySeries) =>
    patch<Series, ModifySeries>(API_ROUTES.series.byId(seriesId), body);

  /**
   * Removes an existing series.
   */
  const remove = (seriesId: number) => del(API_ROUTES.series.byId(seriesId));

  /**
   * --  Production + Series links
   */

  /**
   * Returns all productions linked to a series paginated.
   */
  const getSeriesProductions = (seriesId: number) =>
    get<PaginatedResponse<Production | ProductionView>>(
      API_ROUTES.series.productions(seriesId),
    );

  /**
   * Links a production to a series.
   */
  const linkProductionToSeries = (seriesId: number, productionId: number) =>
    put(API_ROUTES.series.productionById(seriesId, productionId), {});

  /**
   * Unlinks a production from a series.
   */
  const unlinkProductionFromSeries = (seriesId: number, productionId: number) =>
    del(API_ROUTES.series.productionById(seriesId, productionId));

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
    getSeriesProductions,
    linkProductionToSeries,
    unlinkProductionFromSeries,
  };
}

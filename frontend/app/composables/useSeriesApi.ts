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
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface SeriesListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
}

/**
 * Frontend API calls for series.
 * All GET requests are public. All other endpoints require an API key.
 */
export function useSeriesApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * GET "/series{filters}"
   *
   * Returns a paginated list of series.
   * Returns View objects if a language is passed, otherwise standard Series objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
  }): Promise<ApiResponse<PaginatedResponse<Series>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<SeriesView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
  }: SeriesListOptions = {}) {
    const params = { ...paginationFilters, ...languageFilters };
    const query = buildQueryString(params);

    return get<PaginatedResponse<Series | SeriesView>>(
      `${API_ROUTES.series.base}${query}`,
    );
  }

  /**
   * GET "/series/:seriesId"
   *
   * Returns a specific series by its ID.
   * Returns a View object if a language is passed, otherwise a standard Series object.
   */
  function getById(seriesId: number): Promise<ApiResponse<Series>>;
  function getById(
    seriesId: number,
    lang: Language,
  ): Promise<ApiResponse<SeriesView>>;
  function getById(seriesId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<Series | SeriesView>(
      `${API_ROUTES.series.byId(seriesId)}${query}`,
    );
  }

  /**
   * POST "/series"
   *
   * Creates a new series.
   */
  function create(body: CreateSeries) {
    return post<Series, CreateSeries>(API_ROUTES.series.base, body);
  }

  /**
   * PUT "/series/:seriesId"
   *
   * Replaces an existing series.
   */
  function replace(seriesId: number, body: ReplaceSeries) {
    return put<Series, ReplaceSeries>(API_ROUTES.series.byId(seriesId), body);
  }

  /**
   * PATCH "/series/:seriesId"
   *
   * Modifies an existing series.
   */
  function modify(seriesId: number, body: ModifySeries) {
    return patch<Series, ModifySeries>(API_ROUTES.series.byId(seriesId), body);
  }

  /**
   * DELETE "/series/:seriesId"
   *
   * Removes an existing series.
   */
  function remove(seriesId: number) {
    return del(API_ROUTES.series.byId(seriesId));
  }

  /**
   * ==============================
   * Production + Series links
   * ==============================
   */

  /**
   * GET "/series/:seriesId/productions"
   *
   * Returns all productions linked to a series paginated.
   * Returns View objects if a language is passed, otherwise standard Production objects.
   */
  function getSeriesProductions(
    seriesId: number,
  ): Promise<ApiResponse<PaginatedResponse<Production>>>;
  function getSeriesProductions(
    seriesId: number,
    lang: Language,
    paginationFilters?: PaginationFilter,
  ): Promise<ApiResponse<PaginatedResponse<ProductionView>>>;
  function getSeriesProductions(
    seriesId: number,
    lang?: Language,
    paginationFilters?: PaginationFilter,
  ) {
    const params = { ...(lang ? { lang } : {}), ...paginationFilters };
    const query = buildQueryString(params);
    return get<PaginatedResponse<Production | ProductionView>>(
      `${API_ROUTES.series.productions(seriesId)}${query}`,
    );
  }

  /**
   * PUT "/series/:seriesId/productions/:productionId"
   *
   * Links a production to a series.
   */
  function linkProductionToSeries(seriesId: number, productionIds: number[]) {
    return put(API_ROUTES.series.productions(seriesId), {
      items: productionIds,
    });
  }

  /**
   * DELETE "/series/:seriesId/productions/:productionId"
   *
   * Unlinks a production from a series.
   */
  function unlinkProductionFromSeries(seriesId: number, productionId: number) {
    return del(API_ROUTES.series.productionById(seriesId, productionId));
  }

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

import type {
  CreatePrintItem,
  FilterPrintItem,
  Language,
  LanguageQuery,
  ModifyPrintItem,
  PaginatedResponse,
  PaginationFilter,
  PrintItem,
  PrintItemView,
  ReplacePrintItem,
} from "@repo/common";
import { API_ROUTES } from "~/utils/apiRoutes";
import { buildQueryString } from "~/utils/formatters";

interface PrintItemListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  printItemFilters?: FilterPrintItem;
}

/**
 * Frontend API calls for print items.
 * All GET requests are public. All other endpoints require an API key.
 */
export function usePrintApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * GET "/prints{filters}"
   *
   * Returns a paginated list of print items.
   * Returns View objects if a language is passed, otherwise standard Item objects.
   */
  function getAll(options?: {
    paginationFilters?: PaginationFilter;
    printItemFilters?: FilterPrintItem;
  }): Promise<ApiResponse<PaginatedResponse<PrintItem>>>;
  function getAll(options: {
    paginationFilters?: PaginationFilter;
    printItemFilters?: FilterPrintItem;
    languageFilters: LanguageQuery;
  }): Promise<ApiResponse<PaginatedResponse<PrintItemView>>>;
  function getAll({
    paginationFilters,
    languageFilters,
    printItemFilters,
  }: PrintItemListOptions = {}) {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...printItemFilters,
    };
    const query = buildQueryString(params);

    return get<PaginatedResponse<PrintItem | PrintItemView>>(
      `${API_ROUTES.prints.base}${query}`,
    );
  }

  /**
   * GET "/prints/:printId"
   *
   * Get a specific print by its ID.
   * Returns a View object if a language is passed, otherwise a standard Item object.
   */
  function getById(printId: number): Promise<ApiResponse<PrintItem>>;
  function getById(
    printId: number,
    lang: Language,
  ): Promise<ApiResponse<PrintItemView>>;
  function getById(printId: number, lang?: Language) {
    const query = lang ? `?lang=${lang}` : "";
    return get<PrintItem | PrintItemView>(
      `${API_ROUTES.prints.byId(printId)}${query}`,
    );
  }

  /**
   * POST "/prints"
   *
   * Create a new print.
   */
  function create(body: CreatePrintItem) {
    return post<PrintItem, CreatePrintItem>(API_ROUTES.prints.base, body);
  }

  /**
   * PUT "/prints/:printId"
   *
   * Replace an existing print.
   */
  function replace(printId: number, body: ReplacePrintItem) {
    return put<PrintItem, ReplacePrintItem>(
      API_ROUTES.prints.byId(printId),
      body,
    );
  }

  /**
   * PATCH "/prints/:printId"
   *
   * Modifies an existing print.
   */
  function modify(printId: number, body: ModifyPrintItem) {
    return patch<PrintItem, ModifyPrintItem>(
      API_ROUTES.prints.byId(printId),
      body,
    );
  }

  /**
   * DELETE "/prints/:printId"
   *
   * Removes an existing print.
   */
  function remove(printId: number) {
    return del(API_ROUTES.prints.byId(printId));
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

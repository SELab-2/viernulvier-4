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

interface PrintItemListOptions {
  paginationFilters?: PaginationFilter;
  languageFilters?: LanguageQuery;
  printItemFilters?: FilterPrintItem;
}

/**
 * Frontend API calls for print items.
 */
export function usePrintApi() {
  const { get, post, patch, put, del } = useApi();

  /**
   * Get all print items.
   */
  const getAll = ({
    paginationFilters,
    languageFilters,
    printItemFilters,
  }: PrintItemListOptions = {}) => {
    const params = {
      ...paginationFilters,
      ...languageFilters,
      ...printItemFilters,
    };

    const cleanParams = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(params).filter(([_, value]) => value != null),
    );

    const queryString = new URLSearchParams(
      cleanParams as unknown as Record<string, string>,
    ).toString();

    const query = queryString ? `?${queryString}` : "";

    return get<PaginatedResponse<PrintItem | PrintItemView>>(
      `${API_ROUTES.prints.base}${query}`,
    );
  };

  /**
   * Get a specific print by it's ID.
   */
  const getById = (printId: number, lang?: Language) => {
    const query = lang ? `?lang=${lang}` : "";
    return get<PrintItem | PrintItemView>(
      `${API_ROUTES.prints.byId(printId)}${query}`,
    );
  };

  /**
   * Create a new print.
   */
  const create = (body: CreatePrintItem) =>
    post<PrintItem, CreatePrintItem>(API_ROUTES.prints.base, body);

  /**
   * Replace an existing print.
   */
  const replace = (printId: number, body: ReplacePrintItem) =>
    put<PrintItem, ReplacePrintItem>(API_ROUTES.prints.byId(printId), body);

  /**
   * Modifies an existing print.
   */
  const modify = (printId: number, body: ModifyPrintItem) =>
    patch<PrintItem, ModifyPrintItem>(API_ROUTES.prints.byId(printId), body);

  /**
   * Removes an existing print.
   */
  const remove = (printId: number) => del(API_ROUTES.prints.byId(printId));

  return {
    getAll,
    getById,
    create,
    replace,
    modify,
    remove,
  };
}

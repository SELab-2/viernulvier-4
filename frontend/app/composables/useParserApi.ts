import { API_ROUTES } from "../utils/apiRoutes";

type ParserTarget = "productions" | "events" | "tags" | "blogs" | "prices";

/**
 * Composable for CSV parser upload endpoints.
 * Uploads files as multipart/form-data so backend can parse directly from memory.
 */
export function useParserApi() {
  const { post } = useApi();

  const endpointByTarget: Record<ParserTarget, string> = {
    productions: API_ROUTES.parser.productions,
    events: API_ROUTES.parser.events,
    tags: API_ROUTES.parser.tags,
    blogs: API_ROUTES.parser.blogs,
    prices: API_ROUTES.parser.prices,
  };

  const uploadCsv = (target: ParserTarget, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return post<unknown, FormData>(endpointByTarget[target], formData);
  };

  return {
    uploadCsv,
  };
}

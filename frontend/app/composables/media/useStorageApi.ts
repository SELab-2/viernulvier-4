/**
 * Frontend connection to the Media Storage API.
 *
 * NOTE: This Composable does not include a GET to the storage because the media
 * is hosted with NGINX on the server. That way all you have to do is GET the
 * URL that is in the crop or print item.
 */
export function useStorageApi() {
  const { post, del } = useApi();

  /**
   * Saves media to a specified URL on the server.
   */
  const saveMedia = (url: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    body.append("url", url);
    return post<string, FormData>(API_ROUTES.storage.base, body);
  };

  /**
   * Deletes media from a specified URL on the server.
   */
  const deleteMedia = (url: string) => {
    const encodedUrl = encodeURIComponent(url);

    return del(`${API_ROUTES.storage.base}?url=${encodedUrl}`);
  };

  return {
    saveMedia,
    deleteMedia,
  };
}

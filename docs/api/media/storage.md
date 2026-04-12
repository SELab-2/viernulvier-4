# Media Storage API

## 💾 Storage Management
### [GET] `/media/storage/fetch`
Retrieves media from a given URL.
- **Query Parameters:** `url` (string) - The URL of the media you want to fetch. **Note:** This must be URL-encoded by the client (e.g., using `encodeURIComponent()`).
- **Returns:** A binary file stream (the physical media file, ready to be viewed or downloaded by the browser).

### [POST] `/media/storage`
Saves a physical media file to a given URL on the server.
- **Security:** `apiKey` required.
- **Body:** `multipart/form-data` containing:
    - `url` (string): The target destination URL.
    - `file` (binary): The actual file payload.
- **Note:** The URL must be within the domain of your `MEDIA_BASE_URL` parameter, otherwise, the server will return a Bad Request error.
- **Returns:** `string` — the URL of the saved media.

### [DELETE] `/media/storage`
Deletes a physical media file at a given URL.
- **Security:** `apiKey` required.
- **Body:** `{ url: string }`
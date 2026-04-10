# Media Storage API

### [GET] `/media/storage/fetch`

Retrieves media from a given URL.

- **Query Parameter:** `url` (string) - The URL/ relative path of the media you want to fetch. **Note:** This must be
  URL-encoded by
  the client (e.g., using `encodeURIComponent()`).
- **Returns:** A binary file stream (the physical media file, ready to be viewed or downloaded by the browser).

### [POST] `/media/storage`

Saves media to a given URL/path.

- **Security:** `apiKey` required.
- **Body:** `multipart/form-data` with `url: string` and `file: binary`
- note: the URL must be of the type of your MEDIA_BASE_URL param or else you will get bad request errors.
- **Returns:** `string` — the URL of the saved media.

### [DELETE] `/media/storage`

Deletes media at a given URL/path.

- **Security:** `apiKey` required.
- **Body:** `{ url: string }`

> note: this all also works for prints. Instead of using `/photos`, you will need to use `/prints` for it to work.
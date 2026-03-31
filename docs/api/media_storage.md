# Media Storage API

### [POST] `/media/storage/fetch`

Retrieves media from a given URL. Uses POST instead of GET to allow passing a request body.

- **Body:** `{ url: string }`
- **Returns:** Media as a `Buffer`.

### [POST] `/media/storage`

Saves media to a given URL.

- **Security:** `apiKey` required.
- **Body:** `multipart/form-data` with `url: string` and `file: binary`
- note: the URL must be of the type of your MEDIA_BASE_URL param or else you will get bad request errors.
- **Returns:** `string` — the URL of the saved media.

### [DELETE] `/media/storage`

Deletes media at a given URL.

- **Security:** `apiKey` required.
- **Body:** `{ url: string }`
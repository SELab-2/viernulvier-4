# Media Item API

## 📄 Item Management
### [GET] `/items`
Fetches a list of media items. Supports pagination (`limit`, `offset`) and language filtering (`lang`) via query parameters.
- **Returns:** `PaginatedResponse<MediaItemDto | MediaItemViewDto>` a paginated list of media items. If a language is queried, the returned DTOs are flattened for that specific language.

### [GET] `/items/:itemId`
Retrieves a specific media item by its ID. Supports language filtering (`lang`) via query parameters.
- **Returns:** `MediaItemDto | MediaItemViewDto`

### [POST] `/items`
Creates a new media item.
- **Security:** `apiKey` required.
- **Body:** `CreateMediaItemDto`
- **Returns:** `MediaItemDto`

### [PUT] `/items/:itemId`
Replaces an existing media item entirely.
- **Security:** `apiKey` required.
- **Body:** `ReplaceMediaItemDto`
- **Returns:** `MediaItemDto`

### [PATCH] `/items/:itemId`
Updates specific fields of an existing media item.
- **Security:** `apiKey` required.
- **Body:** `ModifyMediaItemDto`
- **Returns:** `MediaItemDto`

### [DELETE] `/items/:itemId`
Permanently deletes a media item.
- **Security:** `apiKey` required.

## 🔗 Relationships
### [GET] `/items/:itemId/crops`
Retrieves all crops associated with this media item.
- **Returns:** Array of `MediaCropDto`

### [PUT] `/items/:itemId/crops/:cropId`
Links a specific crop to a media item.
- **Security:** `apiKey` required.

### [DELETE] `/items/:itemId/crops/:cropId`
Unlinks a crop from a media item.
- **Security:** `apiKey` required.
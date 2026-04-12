# Media Gallery API

## 🖼️ Gallery Management
### [GET] `/galleries`
Fetches a list of media galleries. Supports pagination via query parameters.
- **Returns:** `PaginatedResponse<MediaGalleryDto>` a paginated list of media galleries.

### [GET] `/galleries/:galleryId`
Retrieves a specific media gallery by its ID.
- **Returns:** `MediaGalleryDto`

### [POST] `/galleries`
Creates a new media gallery.
- **Security:** `apiKey` required.
- **Body:** `CreateMediaGalleryDto`
- **Returns:** `MediaGalleryDto`

### [PUT] `/galleries/:galleryId`
Replaces an existing media gallery entirely.
- **Security:** `apiKey` required.
- **Body:** `ReplaceMediaGalleryDto`
- **Returns:** `MediaGalleryDto`

### [PATCH] `/galleries/:galleryId`
Updates specific fields of an existing media gallery.
- **Security:** `apiKey` required.
- **Body:** `ModifyMediaGalleryDto`
- **Returns:** `MediaGalleryDto`

### [DELETE] `/galleries/:galleryId`
Permanently deletes a media gallery.
- **Security:** `apiKey` required.

## 🔗 Relationships
### [GET] `/galleries/:galleryId/items`
Retrieves all items associated with this gallery.
- **Returns:** Array of `MediaItemDto` or `PrintItemDto`

### [PUT] `/galleries/:galleryId/items/:itemId`
Links a specific media item to a media gallery.
- **Security:** `apiKey` required.

### [DELETE] `/galleries/:galleryId/items/:itemId`
Unlinks a media item from a media gallery.
- **Security:** `apiKey` required.

### [PUT] `/galleries/:galleryId/prints/:printItemId`
Links a specific print item to a media gallery.
- **Security:** `apiKey` required.

### [DELETE] `/galleries/:galleryId/prints/:printItemId`
Unlinks a print item from a media gallery.
- **Security:** `apiKey` required.
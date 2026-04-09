# Media Crops API

## 🖼️ Crops Management
### [GET] `/crops`
Retrieves all media crops. Supports filters via query parameters (e.g., limit, offset).
- **Returns:** `PaginatedResponse<MediaCropDto>` a paginated list of media crops.

### [GET] `/crops/:cropId`
Retrieves a specific media crop by its ID.
- **Returns:** `MediaCropDto`

### [POST] `/crops`
Creates a new media crop entry. 
- **Security:** `apiKey` required.
- **Body:** `CreateMediaCropDto` (Optionally include `autoDownload: boolean` in the body to automatically fetch and save external media to the local storage).
- **Returns:** `MediaCropDto`

### [PUT] `/crops/:cropId`
Replaces an entire media crop object.
- **Security:** `apiKey` required.
- **Body:** `ReplaceMediaCropDto`
- **Returns:** `MediaCropDto`

### [PATCH] `/crops/:cropId`
Updates specific fields of an existing media crop.
- **Security:** `apiKey` required.
- **Body:** `ModifyMediaCropDto`
- **Returns:** `MediaCropDto`

### [DELETE] `/crops/:cropId`
Permanently deletes a media crop.
- **Security:** `apiKey` required.
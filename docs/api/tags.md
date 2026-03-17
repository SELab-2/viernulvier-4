# Tags API

### [GET] `/tags`
Retrieves a list of all available tags.
- **Returns:** `PaginatedResponse<Tag | TagView>` a paginated list of tags or tag views.

### [GET] `/tags/:tagId`
Retrieves a specific tag by its ID.
- **Returns:** `Tag`

### [POST] `/tags`
Creates a new tag.
- **Security:** `apiKey` required.
- **Body:** `CreateTag`
- **Returns:** `Tag`

### [PATCH] `/tags/:tagId`
Updates an existing tag's metadata.
- **Security:** `apiKey` required.
- **Body:** `UpdateTag`
- **Returns:** `Tag`

### [DELETE] `/tags/:tagId`
Permanently deletes a tag.
- **Security:** `apiKey` required.

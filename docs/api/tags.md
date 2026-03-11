# Tags API

### [GET] `/tags`
Retrieves a list of all available tags.
- **Returns:** Array of `Tag`

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
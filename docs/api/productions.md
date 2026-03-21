# Productions API

## 🎬 Productions
### [GET] `/productions`
Retrieves all productions. Supports filtering by `tag_ids`.
- **Returns:** `PaginatedResponse<Production | ProductionView>` a [paginated](../pagination/index.md) list of productions or production views.

### [GET] `/productions/:productionId`
Retrieves a specific production by its ID.
- **Returns:** `Production`

### [POST] `/productions`
Creates a new production entry.
- **Security:** `apiKey` required.
- **Body:** `CreateProduction`
- **Returns:** `Production`

### [PUT] `/productions/:productionId`
Replaces an entire production object.
- **Security:** `apiKey` required.
- **Body:** `Production`

### [PATCH] `/productions/:productionId`
Updates specific fields of an existing production.
- **Security:** `apiKey` required.
- **Body:** `UpdateProduction`

### [DELETE] `/productions/:productionId`
Permanently deletes a production.
- **Security:** `apiKey` required.

## 🏷️ Relationships
### [GET] `/productions/:productionId/tags`
Retrieves all tags linked to this production.
- **Returns:** Array of `Tag`

### [PUT] `/productions/:productionId/tags/:tagId`
Links a tag to a production.
- **Security:** `apiKey` required.

### [DELETE] `/productions/:productionId/tags/:tagId`
Unlinks a tag from a production.
- **Security:** `apiKey` required.

### [GET] `/productions/:productionId/blogs`
Retrieves all blog posts associated with this production.
- **Returns:** Array of `Blog`

### [PUT] `/productions/:productionId/blogs/:blogId`
Links a blog post to a production.
- **Security:** `apiKey` required.

### [DELETE] `/productions/:productionId/blogs/:blogId`
Unlinks a blog post from a production.
- **Security:** `apiKey` required.

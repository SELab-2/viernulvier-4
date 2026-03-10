# Productions API

## 🎬 Productions
### [GET] `/productions`
Returns all productions. Supports `tag_ids` filter.

### [GET] `/productions/:productionId`
Returns a specific production.

### [POST] `/productions`
Creates a production. (**Security:** `apiKey` required)

### [PUT] `/productions/:productionId`
Replaces a production. (**Security:** `apiKey` required)

### [PATCH] `/productions/:productionId`
Updates a production. (**Security:** `apiKey` required)

### [DELETE] `/productions/:productionId`
Deletes a production. (**Security:** `apiKey` required)

## 🏷️ Production Relationships (Tags & Blogs)
### [GET] `/productions/:productionId/tags`
Returns tags for this production.

### [PUT] `/productions/:productionId/tags/:tagId`
Links a tag to a production. (**Security:** `apiKey` required)

### [DELETE] `/productions/:productionId/tags/:tagId`
Removes a tag from a production. (**Security:** `apiKey` required)

### [GET] `/productions/:productionId/blogs`
Returns blogs linked to this production.

### [PUT] `/productions/:productionId/blogs/:blogId`
Links a blog to a production. (**Security:** `apiKey` required)

### [DELETE] `/productions/:productionId/blogs/:blogId`
Unlinks a blog from a production. (**Security:** `apiKey` required)
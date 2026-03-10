# Productions API

## 🎬 Productions
### [GET] `/productions`
Returns all productions.

### [POST] `/productions`
Creates a new production. (**Security:** `apiKey` required)

### [PATCH] `/productions/:productionId`
Updates a production. (**Security:** `apiKey` required)

## 🏷️ Relationships
### [PUT] `/productions/:productionId/tags/:tagId`
Links a tag to a production.

### [PUT] `/productions/:productionId/blogs/:blogId`
Links a blog post to a production.
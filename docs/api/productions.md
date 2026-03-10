# Productions API

## 🎬 Productions
### [GET] `/productions`
- **Returns:** Array of `ProductionDto`

### [POST] `/productions`
- **Security:** `apiKey` required | **Body:** `CreateProductionDto`

### [PUT] `/productions/:productionId`
- **Security:** `apiKey` required | **Body:** `ProductionDto`

### [PATCH] `/productions/:productionId`
- **Security:** `apiKey` required | **Body:** `UpdateProductionDto`

### [DELETE] `/productions/:productionId`
- **Security:** `apiKey` required

## 🏷️ Relationships
### [GET] `/productions/:productionId/tags`
- **Returns:** Array of `TagDto`

### [PUT] `/productions/:productionId/tags/:tagId`
- **Security:** `apiKey` required | Links tag.

### [DELETE] `/productions/:productionId/tags/:tagId`
- **Security:** `apiKey` required | Unlinks tag.

### [GET] `/productions/:productionId/blogs`
- **Returns:** Array of `BlogDto`

### [PUT] `/productions/:productionId/blogs/:blogId`
- **Security:** `apiKey` required | Links blog.

### [DELETE] `/productions/:productionId/blogs/:blogId`
- **Security:** `apiKey` required | Unlinks blog.
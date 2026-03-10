# Tags API

### [GET] `/tags`
- **Returns:** Array of `TagDto`

### [GET] `/tags/:tagId`
- **Returns:** `TagDto`

### [POST] `/tags`
- **Security:** `apiKey` required | **Body:** `CreateTagDto`

### [PATCH] `/tags/:tagId`
- **Security:** `apiKey` required | **Body:** `UpdateTagDto`

### [DELETE] `/tags/:tagId`
- **Security:** `apiKey` required
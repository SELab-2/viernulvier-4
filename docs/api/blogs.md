# Blogs API

### [GET] `/blogs`
- **Returns:** `PaginatedResponse<Blog | BlogView>` a [paginated](../pagination/index.md) list of blogs or blog views.

### [GET] `/blogs/:blogId`
- **Returns:** `BlogDto`

### [POST] `/blogs`
- **Security:** `apiKey` required | **Body:** `CreateBlogDto`

### [PUT] `/blogs/:blogId`
- **Security:** `apiKey` required | **Body:** `ModifyBlogDto`

### [PATCH] `/blogs/:blogId`
- **Security:** `apiKey` required | **Body:** `ModifyBlogDto`

### [DELETE] `/blogs/:blogId`
- **Security:** `apiKey` required

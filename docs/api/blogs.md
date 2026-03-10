# Blogs API

### [GET] `/blogs`
Returns all blog posts.

### [GET] `/blogs/:blogId`
Returns a specific blog post.

### [POST] `/blogs`
Creates a blog post. (**Security:** `apiKey` required)

### [PUT] `/blogs/:blogId`
Replaces a blog post. (**Security:** `apiKey` required)

### [PATCH] `/blogs/:blogId`
Updates a blog post. (**Security:** `apiKey` required)

### [DELETE] `/blogs/:blogId`
Deletes a blog post. (**Security:** `apiKey` required)
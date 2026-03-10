# Locations API

### [GET] `/locations`
- **Returns:** Array of `LocationDto`

### [GET] `/locations/:locationId`
- **Returns:** `LocationDto`

### [POST] `/locations`
- **Security:** `apiKey` required | **Body:** `CreateLocationDto`

### [PATCH] `/locations`
Updates an existing location (ID in body).
- **Security:** `apiKey` required | **Body:** `UpdateLocationDto`

### [DELETE] `/locations/:locationId`
- **Security:** `apiKey` required
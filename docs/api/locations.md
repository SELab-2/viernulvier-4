# Locations API

### [GET] `/locations`
Retrieves a list of all registered venues and locations.
- **Returns:** `PaginatedResponse<Location | LocationView>` a [paginated](../pagination/index.md) list of locations or location views.

### [GET] `/locations/:locationId`
Retrieves a specific location by its ID.
- **Returns:** `Location`

### [POST] `/locations`
Creates a new location entry.
- **Security:** `apiKey` required.
- **Body:** `CreateLocation`
- **Returns:** `Location`

### [PATCH] `/locations`
Updates an existing location. Note: The ID must be provided within the request body.
- **Security:** `apiKey` required.
- **Body:** `UpdateLocation`
- **Returns:** `Location`

### [DELETE] `/locations/:locationId`
Permanently deletes a location.
- **Security:** `apiKey` required.

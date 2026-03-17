# Events API

## 📅 Events Management
### [GET] `/events`
Returns all events. Supports filters via query parameters.
- **Returns:** `PaginatedResponse<Event>` a paginated list of events.

### [GET] `/events/:eventId`
Retrieves a specific event by its ID.
- **Returns:** `Event`

### [POST] `/events`
Creates a new event entry.
- **Security:** `apiKey` required
- **Body:** `CreateEvent`
- **Returns:** `Event`

### [PUT] `/events/:eventId`
Replaces an entire event object.
- **Security:** `apiKey` required.
- **Body:** `Event`
- **Returns:** `Event`

### [PATCH] `/events/:eventId`
Updates specific fields of an existing event.
- **Security:** `apiKey` required.
- **Body:** `UpdateEvent`
- **Returns:** `Event`

### [DELETE] `/events/:eventId`
Permanently deletes an event.
- **Security:** `apiKey` required.

## 🔗 Relationships
### [GET] `/events/:eventId/prices`
Retrieves all prices associated with this event.
- **Returns:** Array of `Price`

### [PUT] `/events/:eventId/prices/:priceId`
Links a specific price category to an event.
- **Security:** `apiKey` required

### [DELETE] `/events/:eventId/prices/:priceId`
Unlinks a price category from an event.
- **Security:** `apiKey` required

### [GET] `/events/:eventId/locations`
Retrieves the location assigned to this event.
- **Returns:** `Location`

### [PUT] `/events/:eventId/locations/:locationId`
Links a specific location to an event.
- **Security:** `apiKey` required.

### [DELETE] `/events/:eventId/locations`
Unlinks the location from an event.
- **Security:** `apiKey` required.

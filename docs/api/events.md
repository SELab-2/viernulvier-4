# Events API

## 📅 Events Management
### [GET] `/events`
Returns all events. Supports filtering via query strings.

### [POST] `/events`
Creates a new event. (**Security:** `apiKey` required)

### [PATCH] `/events/:eventId`
Partially updates an event. (**Security:** `apiKey` required)

### [DELETE] `/events/:eventId`
Deletes an event. (**Security:** `apiKey` required)

## 🔗 Relationships
### [GET] `/events/:eventId/prices`
Lists prices for this event.

### [PUT] `/events/:eventId/prices/:priceId`
Links a price to an event.

### [GET] `/events/:eventId/locations`
Returns the location for this event.
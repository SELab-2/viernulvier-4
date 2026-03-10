# Events API

## 📅 Events Management
### [GET] `/events`
Returns all events. Supports query filters.

### [GET] `/events/:eventId`
Returns a specific event.

### [POST] `/events`
Creates an event. (**Security:** `apiKey` required)

### [PUT] `/events/:eventId`
Replaces an existing event. (**Security:** `apiKey` required)

### [PATCH] `/events/:eventId`
Partially updates an event. (**Security:** `apiKey` required)

### [DELETE] `/events/:eventId`
Deletes an event. (**Security:** `apiKey` required)

## 🔗 Event Relationships (Prices & Locations)
### [GET] `/events/:eventId/prices`
Returns prices for this event.

### [PUT] `/events/:eventId/prices/:priceId`
Adds a price to an event. (**Security:** `apiKey` required)

### [DELETE] `/events/:eventId/prices/:priceId`
Removes a price from an event. (**Security:** `apiKey` required)

### [GET] `/events/:eventId/locations`
Returns the location for this event.

### [PUT] `/events/:eventId/locations/:locationId`
Links a location to an event. (**Security:** `apiKey` required)

### [DELETE] `/events/:eventId/locations`
Unlinks the location from an event. (**Security:** `apiKey` required)
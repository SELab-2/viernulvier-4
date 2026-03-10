# Events API

## 📅 Events Management
### [GET] `/events`
Returns all events. Supports filters via query.
- **Returns:** Array of `EventDto`

### [GET] `/events/:eventId`
- **Returns:** `EventDto`

### [POST] `/events`
- **Security:** `apiKey` required | **Body:** `CreateEventDto`

### [PUT] `/events/:eventId`
Replaces an event.
- **Security:** `apiKey` required | **Body:** `EventDto`

### [PATCH] `/events/:eventId`
Updates an event.
- **Security:** `apiKey` required | **Body:** `UpdateEventDto`

### [DELETE] `/events/:eventId`
- **Security:** `apiKey` required

## 🔗 Relationships
### [GET] `/events/:eventId/prices`
- **Returns:** Array of `PriceDto`

### [PUT] `/events/:eventId/prices/:priceId`
- **Security:** `apiKey` required | Links price to event.

### [DELETE] `/events/:eventId/prices/:priceId`
- **Security:** `apiKey` required | Unlinks price from event.

### [GET] `/events/:eventId/locations`
- **Returns:** `LocationDto`

### [PUT] `/events/:eventId/locations/:locationId`
- **Security:** `apiKey` required | Links location to event.

### [DELETE] `/events/:eventId/locations`
- **Security:** `apiKey` required | Unlinks location from event.
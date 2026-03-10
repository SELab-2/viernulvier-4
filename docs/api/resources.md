# Resources

This section contains global metadata and reference data used across the system.

---

## 🏷️ Tags
Tags are used to categorize productions and events.

### [GET] `/tag`
Returns a list of all global tags.

### [GET] `/tag/:id`
Returns a specific tag.

---

## 📍 Locations
Locations represent physical venues where events take place.

### [GET] `/location`
Returns all registered locations.

### [POST] `/location`
Registers a new location. (**Security:** `apiKey` required)
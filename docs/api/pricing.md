# Pricing API

### [GET] `/prices`
Returns the master price list.

### [GET] `/prices/:priceId`
Returns a specific price.

### [POST] `/prices`
Creates a price category. (**Security:** `apiKey` required)

### [PUT] `/prices`
Updates a price category (ID in body). (**Security:** `apiKey` required)

### [DELETE] `/prices/:priceId`
Deletes a price category. (**Security:** `apiKey` required)
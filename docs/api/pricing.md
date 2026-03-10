# Pricing API

## 💰 Price Master List
### [GET] `/prices`
Retrieves the master price list. Supports pagination.

### [POST] `/prices`
Adds a new price category. (**Security:** `apiKey` required)

### [DELETE] `/prices/:priceId`
Deletes a price category.
# Pricing API

### [GET] `/prices`
- **Returns:** `PaginatedResponse<Price | PriceView>` a [paginated](../pagination/index.md) list of prices or price views.

### [GET] `/prices/:priceId`
- **Returns:** `PriceDto`

### [POST] `/prices`
- **Security:** `apiKey` required | **Body:** `CreatePriceDto`

### [PUT] `/prices`
Updates a price (ID in body).
- **Security:** `apiKey` required | **Body:** `UpdatePriceDto`

### [DELETE] `/prices/:priceId`
- **Security:** `apiKey` required

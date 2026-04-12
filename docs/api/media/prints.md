# Prints API

### [GET] `/prints`
- **Query Parameters:**
  - `type` *(optional)*: Filter the list by a specific print type (`affiche`, `brochure`, `drukwerk`, `programma`).
- **Returns:** `PaginatedResponse<PrintItem | PrintItemView>` a [paginated](../pagination/index.md) list of print items or print item views.

### [GET] `/prints/:printItemId`
- **Returns:** `PrintItem | PrintItemView`

### [POST] `/prints`
- **Security:** `apiKey` required | **Body:** `CreatePrintItem`

### [PUT] `/prints/:printItemId`
- **Security:** `apiKey` required | **Body:** `ReplacePrintItem`

### [PATCH] `/prints/:printItemId`
- **Security:** `apiKey` required | **Body:** `ModifyPrintItem`

### [DELETE] `/prints/:printItemId`
- **Security:** `apiKey` required
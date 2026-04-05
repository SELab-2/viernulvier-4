# Prints API

### [GET] `/prints`
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

### [POST] `/prints/:printItemId/galleries/:galleryId`
- **Security:** `apiKey` required
- **Description:** Links an existing print item to an existing media gallery.

### [DELETE] `/prints/:printItemId/galleries/:galleryId`
- **Security:** `apiKey` required
- **Description:** Unlinks a print item from a media gallery.
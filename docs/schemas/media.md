# Media & Prints

The Media schemas define how visual assets, files, and printed materials are structured and grouped within the archive. These schemas are tightly interconnected, allowing images and prints to be organized into galleries and linked to core entities like Productions and Blogs.

---

## 🖨️ Print Item
A **Print Item** represents a physical or digital archival document. It contains localized metadata and is categorized by a specific print type.

*Example: A PDF of the "Hamlet" evening program or a promotional poster.*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `titel` | `LocalizedString` | Yes | The multilingual title of the print. |
| `description` | `LocalizedString` | Yes | Details or text contents of the print. |
| `url` | `string` | Yes | The storage URL where the file is hosted. |
| `print_type` | `PrintType` (Enum) | Yes | Categorization of the print: `'affiche'`, `'brochure'`, `'drukwerk'`, or `'programma'`. |

---

## 📁 Media Gallery
A **Media Gallery** acts as a collection container for multiple Media Items or Print Items. Galleries are used to link a group of assets directly to a Production or Blog.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `legacy_id` | `string` | No | Identifier used for historical data migration. |
| `name` | `string` | No | The display name of the gallery. |
| `type` | `GalleryType` (Enum)| Yes | Defines the gallery's purpose: `'prints'` or `'default'`. |

---

## 🖼️ Media Item
A **Media Item** represents the logical metadata for an uploaded image or video file. It stores the original file details, credits, and positional data.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `legacy_id` | `string` | No | Identifier used for historical data migration. |
| `type` | `string` | Yes | The MIME type of the file (e.g., `image/jpeg`). |
| `original_filename`| `string` | Yes | The original name of the uploaded file. |
| `position` | `PositionEnum` | Yes | Intended display position: `'main'` or `'carousel'`. |
| `width` | `number` | No | Original width of the media in pixels. |
| `height` | `number` | No | Original height of the media in pixels. |
| `title` | `LocalizedString` | No | Multilingual title or alt-text. |
| `description` | `LocalizedString` | No | Multilingual description or caption. |
| `credits` | `LocalizedString` | No | Photographer or artist credits. |

---

## ✂️ Media Crop
A **Media Crop** represents a specific, optimized cutout or scaled version of a parent Media Item. Crops are generated to fit specific frontend UI components.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `legacy_id` | `string` | No | Identifier used for historical data migration. |
| `name` | `CropName` (Enum) | Yes | The specific UI target for the crop (e.g., `'hd_ready'`, `'FE3_header'`). |
| `url` | `string` | Yes | The storage URL for the generated crop file. |
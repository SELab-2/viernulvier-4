# Data Schemas

Welcome to the Data Schemas documentation. This section outlines the structural definitions and data models used throughout the VIERNULVIER archive system. 

We use **Zod** for schema definition and validation. These schemas are shared between the frontend and backend via the `@repo/common` package to ensure strict data consistency across the entire stack.

## Schema Categories

To keep things organized, our data schemas are divided into the following logical domains:

* **[Core Entities](entities.md)**: The primary business logic (`Productions`, `Events`, `Blogs`).
* **[Metadata & Taxonomy](metadata.md)**: Supporting data used for categorization (`Tags`, `Locations`, `Prices`).
* **[Media & Prints](media.md)**: Management of visual assets and physical/digital documents (`Galleries`, `Media Items`, `Crops`, `Print Items`).
* **[Security & Authentication](auth.md)**: Access control models (`Accounts`, `API Keys`).

## Common Types & Utilities

### Localization
Many fields use a localized structure to support multiple languages. Instead of a raw string, these fields expect an object containing translations:

| Type | Structure |
| :--- | :--- |
| `LocalizedString` | `{ "nl": "string", "en": "string" }` |

### Pagination
List endpoints return a standard paginated response to ensure performance.

| Type | Structure |
| :--- | :--- |
| `PaginatedResponse<T>` | `{ "page": number, "limit": number, "totalItems": number, "objects": T[] }` |

### Date Format
All date-time fields follow the strict **ISO 8601** format (e.g., `2024-03-21T12:00:00Z`).
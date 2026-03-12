# Data Schemas Overview

The project uses **Zod** for schema definition and validation. These schemas are shared between the frontend and backend via the `@repo/common` package to ensure data consistency.

## Localization
Many fields use a localized structure. Instead of a raw string, these fields expect an object containing translations:

| Type | Structure |
| :--- | :--- |
| `LocalizedString` | `{ "nl": "string", "en": "string" }` |

## Common Date Format
All date-time fields follow the **ISO 8601** format (e.g., `2024-03-21T12:00:00Z`).
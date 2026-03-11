# Metadata Schemas

## Tag
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `tag` | `LocalizedString` | Yes | Label name |

## Location
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `location` | `LocalizedString` | Yes | Name of the venue/room |

## Price
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `name` | `LocalizedString` | Yes | Ticket type (e.g., "Student") |
| `price` | `float` | Yes | Numerical cost |
# Metadata & Taxonomy

Metadata schemas define the supporting data structures used to categorize, locate, and price the Core Entities. These are typically reusable across multiple Productions and Events.

---

## 🏷️ Tag
**Tags** are labels used for classification and filtering. They allow the frontend to group productions by genre, theme, or department (e.g., "Music", "Theater", "Workshop").

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique identifier for the tag. |
| `tag` | `LocalizedString` | Yes | The display name of the tag. |

---

## 📍 Location
**Locations** represent the physical or virtual spaces where Events take place. This schema ensures consistent naming of venues across the platform.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique identifier for the venue. |
| `location` | `LocalizedString` | Yes | Name of the hall, room, or external site. |

---

## 💰 Price
The **Price** schema defines the financial configuration for tickets. It separates the numerical value from the label, allowing for different price categories (e.g., "Standard", "Student", "Member").

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique identifier for the price tier. |
| `name` | `LocalizedString` | Yes | The label shown to the user (e.g., "Early Bird"). |
| `price` | `float` | Yes | The actual cost in the system's currency. |
# Core Entities

## Production
The base definition for a show or production.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `titel` | `LocalizedString` | Yes | Title of the production |
| `description1` | `LocalizedString` | Yes | Primary description |
| `description2` | `LocalizedString` | No | Secondary/Extra description |
| `tagline` | `LocalizedString` | No | Short marketing hook |
| `artist` | `LocalizedString` | No | Name of the artist/group |
| `performer_type`| `string` | No | Category of performer |
| `attendance_mode`| `string` | No | Online, Offline, or Hybrid |

---

## Event
Represents a specific occurrence or "voorstelling" of a Production.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `production_id` | `number` | Yes | Linked Production ID |
| `starttime` | `ISO DateTime` | Yes | Door opening or start time |
| `endtime` | `ISO DateTime` | No | Expected end time |
| `doors_at` | `ISO DateTime` | No | Doors open time |
| `legacy_id` | `string` | No | Reference for imported data |

---

## Blog
General news posts and updates.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Internal ID |
| `titel` | `LocalizedString` | Yes | Blog title |
| `description` | `LocalizedString` | Yes | Full blog content |
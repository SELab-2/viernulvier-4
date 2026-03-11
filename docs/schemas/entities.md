# Core Entities

Core entities represent the primary business logic of the viernulvier system. They define the structural relationship between artistic content (Productions), their scheduled occurrences (Events), and related editorial content (Blogs).

---

## 🎬 Production
A **Production** acts as the "master template" for a show, performance, or project. It contains all the artistic metadata that remains constant, regardless of when or where it is performed. 

*Example: The play "Hamlet" is a Production; it has a title, a director, and a description.*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `titel` | `LocalizedString` | Yes | The multilingual title of the production. |
| `description1` | `LocalizedString` | Yes | The main marketing or biographical text. |
| `description2` | `LocalizedString` | No | Additional details or technical info. |
| `artist` | `LocalizedString` | No | The name of the main performer or company. |
| `attendance_mode`| `string` | No | Defines if the show is `online`, `offline`, or `hybrid`. |

---

## 📅 Event
An **Event** (also referred to as a "voorstelling") is a specific instance of a Production scheduled at a particular time. While a Production holds the *content*, the Event holds the *logistics*.

*Example: "Hamlet" performed on Friday at 20:00 is an Event linked to the "Hamlet" Production.*

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `production_id` | `number` | Yes | Reference to the parent Production. |
| `starttime` | `ISO DateTime` | Yes | Exact start time of the performance. |
| `endtime` | `ISO DateTime` | No | Estimated end time. |
| `doors_at` | `ISO DateTime` | No | When the venue opens for the audience. |

---

## 📝 Blog
**Blogs** are editorial content pieces used for news, interviews, or background stories. They can exist independently or be linked to specific Productions to provide deeper context for the audience.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `titel` | `LocalizedString` | Yes | The headline of the post. |
| `description` | `LocalizedString` | Yes | The full content/body of the blog post. |
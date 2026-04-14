# Security & Authentication

The Security schemas define the access control and user management system for the VIERNULVIER archive. Access is managed through user accounts (for accessing the admin page/dashboard) and API keys (for machine-to-machine or frontend access).

---

## 👤 Account
An **Account** represents a human user (usually an admin or editor) who can log into the admin page to manage productions, events, media, and other entities.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `username` | `string` | Yes | The unique login name for the user. |
| `password` | `string` | Yes | The securely hashed password. |
| `super_admin` | `boolean` | Yes | If `true`, the user has unrestricted access to all system features, **including creating and managing other accounts**. Defaults to `false`. |

---

## 🔑 API Key
An **API Key** is used to authenticate requests coming from the frontend application or external integrations. 

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes | Unique internal identifier. |
| `key` | `string` | Yes | The actual API key string (up to 255 characters). |
| `active` | `boolean` | Yes | Determines if the key is currently allowed to make requests. Defaults to `true`. |
| `super_key` | `boolean` | Yes | If `true`, bypasses standard restrictions. Defaults to `false`. |

---

## 🔗 Account API Keys (Relations)
Because API keys can be bound to specific accounts for auditing and permission scoping, there is a relational schema linking the two.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `account_id` | `number` | Yes | Reference to the parent Account. |
| `api_key_id` | `number` | Yes | Reference to the assigned API Key. |
# API Overview & Authentication

**Base URL:** `http://localhost:3000`

## 🔐 Authentication
Public login uses a username/password object. Account management requires a **Super API Key**.

### [POST] `/auth/login`
Authenticates a user and starts a session.
- **Request Body:** `CreateAccount`
- **Returns:** `{ account: PublicAccount, apiKey: ApiKey | null }`

### [GET] `/auth`
Returns a list of all existing accounts.
- **Security:** `SuperApiKey` required.
- **Returns:** `PaginatedResponse<PublicAccount>` a paginated list of public accounts. 

### [POST] `/auth`
Creates a new account.
- **Security:** `SuperApiKey` required.
- **Body:** `CreateAccount`
- **Returns:** `PublicAccount`

### [PATCH] `/auth`
Updates an existing account.
- **Security:** `SuperApiKey` required.
- **Body:** `UpdateAccount`
- **Returns:** `PublicAccount`

### [DELETE] `/auth/:accountId`
Permanently deletes an account.
- **Security:** `SuperApiKey` required.
- **Returns:** `boolean`

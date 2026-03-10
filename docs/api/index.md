# API Overview & Authentication

**Base URL:** `http://localhost:3000`

## 🔐 Authentication
Public login uses a username/password object. Account management requires a **Super API Key**.

### [POST] `/auth/login`
Logs into an existing account.
- **Request Body:** `CreateAccountDto`
- **Returns:** `{ account: PublicAccountDto, apiKey: ApiKeyDto | null }`

### [GET] `/auth`
Returns a list of all existing accounts.
- **Security:** `SuperApiKey` required.
- **Returns:** Array of `PublicAccountDto`

### [POST] `/auth`
Creates a new account.
- **Security:** `SuperApiKey` required.
- **Body:** `CreateAccountDto`
- **Returns:** `PublicAccountDto`

### [PATCH] `/auth`
Updates an existing account.
- **Security:** `SuperApiKey` required.
- **Body:** `UpdateAccountDto`
- **Returns:** `PublicAccountDto`

### [DELETE] `/auth/:accountId`
Deletes an account.
- **Security:** `SuperApiKey` required.
- **Returns:** `boolean`
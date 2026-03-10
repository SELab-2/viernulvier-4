# API Overview

This documentation covers the REST API for the viernulvier-4 project.

**Base URL:** `http://localhost:3000`

## 🔐 Authentication
Most modifying endpoints (POST, PUT, PATCH, DELETE) require an **API Key** or a valid **JWT session**.

### [POST] `/auth/login`
Authenticates a user.
**Response (200 OK):**
```json
{ "access_token": "TOKEN_STRING" }
```

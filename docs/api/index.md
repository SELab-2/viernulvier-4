# API Overview & Authentication

**Base URL:** `http://localhost:3000`

## 🔐 Authentication
Administrative actions require an API Key. Regular login uses a username/password object.

### [POST] `/auth/login`
Authenticates a user.
**Request Body:**
{
    "username": "...",
    "password": "..."
}

### [POST] `/auth/verify`
Verifies an API key. (**Security:** `apiKey` required)
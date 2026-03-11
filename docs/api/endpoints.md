# API Endpoints Reference

This page provides the complete documentation for the available REST endpoints of the viernulvier-4 backend. The backend is built using the NestJS framework.

**Base URL (Development):** `http://localhost:3000`

---

## 🔐 Authentication
Manage user access and sessions.

### [POST] `/auth/login`
Authenticates a user and generates a JWT access token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
    "access_token": "eyJhbGci0iJIUzI1..."
}
```

---

## 🏷️ Tags
### [GET] `/tag`
Retrieves a list of available tags.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "name": "theatre"
    },
    {
        "id": 2,
        "name": "concert"
    }
]
```

---

## 📍 Locations
### [GET] `/location`
Returns all registered locations.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "name": "De Vooruit",
        "address": "Sint-Pietersnieuwstraat 23, 9000 Gent"
    }
]
```

---

## 🎬 Production

### [GET] `/production`
Fetches all ongoing productions.

### [GET] `/production/blog`
Retrieves blogs associated with productions.
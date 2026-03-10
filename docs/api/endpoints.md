# API Endpoints Reference

Deze pagina bevat de volledige documentatie van de beschikbare REST endpoints voor de viernulvier-4 backend. De backend is gebouwd met het NestJS framework.

**Base URL (Development):** `http://localhost:3000`

---

## 🔐 Authentication
Beheert gebruikerstoegang en sessies.

### [POST] `/auth/login`
Authenticeert een gebruiker en genereert een JWT access token.

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
    "access_token": ""
}
```

---

## 🏷️ Tags
### [GET] `/tag`
Haalt een lijst op van alle beschikbare tags.

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "name": "Samenwerking"
    },
    {
        "id": 2,
        "name": "Event"
    }
]
```

---

## 📍 Locations
### [GET] `/location`
Geeft alle geregistreerde locaties terug.

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
Haalt alle lopende producties op.

### [GET] `/production/blog`
Haalt blogs op die gekoppeld zijn aan producties.
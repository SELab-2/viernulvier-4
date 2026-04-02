# Media Storage

## Overview

Media files (images, videos, etc.) are served statically via **Nginx** in production. In development, the NestJS backend
serves them directly from a local folder instead.

The `MediaStorageService` abstracts this difference — callers always work with full URLs and never need to know where
the files actually live.

---

## Production

In production, Nginx serves media files from `/var/www/photos` on the server.

### How It Works

- The backend saves files to `/var/www/photos` (via HTTP PUT to itself on `127.0.0.1`)
- Nginx serves them publicly at `https://sel2-4.ugent.be/photos/<path>`
- Only requests from `127.0.0.1` (the backend itself) can PUT or DELETE files
- The full URL is stored in the database, e.g. `https://sel2-4.ugent.be/photos/1/foto.jpg`

### Directory Structure

Subdirectories are supported and must be created by the backend before saving:

```
/var/www/photos/
├── 1/
│   ├── foto.jpg
│   └── video.mp4
└── 2/
    └── foto.jpg
```

---

## Development

In development, there is no Nginx. Instead, NestJS serves the files itself as static assets from `assets/media/` inside
the project directory.

### How It Works

The `LocalMediaStorage` class strips the dev base URL from any incoming URL to get the relative file path, then
reads/writes directly on disk:

```
URL:       http://127.0.0.1:3000/photos/1/foto.jpg
Strip:     http://127.0.0.1:3000/photos
Remaining: /1/foto.jpg
Full path: <project_root>/assets/media/1/foto.jpg
```

This means the same URL format is used everywhere — the service just resolves it differently depending on the
environment.

### Static Asset Serving (main.ts)

```typescript
if (process.env.NODE_ENV === "development") {
  app.useStaticAssets(path.join(process.cwd(), "assets/media"), {
    prefix: "/media_dev",
  });
}
```

---

## MediaStorageService

The service picks the correct storage backend at startup based on `NODE_ENV`:

```typescript
constructor()
{
  this.storage = process.env.NODE_ENV === "development"
    ? new LocalMediaStorage()   // reads/writes assets/media on disk
    : new RemoteMediaStorage(); // PUT/GET/DELETE via HTTP to Nginx
}
```

### Environment Variables

| Variable         | Description                       | Default (dev)                  | Default (prod)                   |
|------------------|-----------------------------------|--------------------------------|----------------------------------|
| `MEDIA_BASE_URL` | Base URL used to build media URLs | `http://127.0.0.1:3000/photos` | `https://sel2-4.ugent.be/photos` |

Set these in your `.env` files:

```bash
# .env.development
MEDIA_BASE_URL=http://127.0.0.1:3000/media_dev

# .env.production
MEDIA_BASE_URL=https://sel2-4.ugent.be/photos
```

> **Important:** Always use `npm run start:dev` for development. Running `npm run start:prod` locally will use
`RemoteMediaStorage` and attempt HTTP calls to the production server.

> **Note:** when asking a photo for dev env from the database with the productionURL, please note that that photo must
> be available under the assets/media file or else it will not be found.

## Backend Deployment Details

The backend requires some configuration before it can run. This page walks you through everything you need to set up.

---

## Environment Variables

The backend is configured via a `.env` file in the project root. To get started, copy the provided example file:

```bash
cp .env.example .env
```

Then open `.env` and fill in the correct values for your setup:

| Variable         | Description                                                                                             |
|------------------|---------------------------------------------------------------------------------------------------------|
| `DB_USER`        | PostgreSQL username                                                                                     |
| `DB_HOST`        | Database host — use `127.0.0.1` if running locally on the same server                                   |
| `DB_NAME`        | Name of the PostgreSQL database                                                                         |
| `DB_PASSWORD`    | Password for the PostgreSQL user                                                                        |
| `DB_PORT`        | PostgreSQL port — default is `5432`                                                                     |
| `CLIENT_API_KEY` | API key used for the scraper.                                                                           |
| `ENABLE_SCRAPER` | Enables the scraper that automatically fetches from the main API at midnight — set to `true` or `false` |

> **Note:** Never commit your `.env` file to version control. It is already listed in `.gitignore`, but double-check
> before pushing.

---

## Process Manager Configuration

The backend's runtime variables are configured in `ecosystem.config.js` in the project root. This file contains the pm2
process definitions for both the frontend and backend.

For the backend, the only value you need to change is `cwd` — set it to the absolute path of the `backend` folder on
your server:

```js
{
  name: "backend",
  script: "dist/main.js",
  cwd: "/absolute/path/to/project/backend",
  env: {
    PORT: 3000,
    NODE_ENV: "production",
  },
},
```

> **Note:** `PORT` and `NODE_ENV` can be left as-is unless you have a specific reason to change them.
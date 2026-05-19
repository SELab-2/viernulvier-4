## Frontend Deployment Details

The frontend is configured in the same `ecosystem.config.js` file as the backend. In most cases, this is the only thing
you need to update for the frontend to work.

Locate the frontend entry and update `cwd` to the absolute path of the `frontend` folder on your server, and set
`NUXT_API_BASE` to your domain:

```js
{
  name: "frontend",
    script
:
  ".output/server/index.mjs",
    cwd
:
  "/absolute/path/to/project/frontend",
    env
:
  {
    PORT: 3001,
      NUXT_API_BASE
  :
    "https://your-domain.com/api",
      NUXT_BASE
  :
    "/archive/",
  }
,
}
,
```

| Variable        | Description                                                           |
|-----------------|-----------------------------------------------------------------------|
| `PORT`          | Port the frontend runs on — default is `3001`                         |
| `NUXT_API_BASE` | Full URL to the backend API — must match your domain and Nginx config |
| `NUXT_BASE`     | Base path the frontend is served from — default is `/archive/`        |

## Frontend CMS

The CMS part of the frontend can be used to manage your data once the server is set up and you have created your initial
account (see [database](database.md)).
You can find this under /admin in the url.  
For example: `https://example.base.url/admin` This will redirect you to the login screen.
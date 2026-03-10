# Server Overview

This project consists of several interconnected components that must be deployed and configured together on a server to
function correctly. These components are:

- **Database** – PostgreSQL
- **Backend/API** – NestJS
- **Frontend** – Vue + Nuxt

This page provides a brief structural overview and basic setup instructions. See the individual component pages linked
below for more detailed information.

---

## Database

The database is built on [PostgreSQL](https://www.postgresql.org/download/). You can install it on your server by
following [this guide](link).

After installing PostgreSQL, load the database from the provided dump to establish a starting point:
> **Note**: The <username> and <database_name> variables are those from your psql installation. You can find the
> dump_file under 'server/pg.dump'.

```bash
pg_restore -U <username> -d <database_name> <dump_file>.dump
```

This starting point includes an admin account and API key to get you started. For more information, see
the [database page](insert page here).

> **Note:** After restoring the database, some additional configuration is still required. Please review
> the [database page](insert here) before proceeding.

---

## API / Backend

The backend is built with [NestJS](https://nestjs.com/). In-depth documentation on its architecture and internals can be
found on the [backend overview page](insert here).

This section focuses only on what you need to know when deploying the backend to your server. For a step-by-step
deployment guide, see the [backend server setup page](insert here).

In order to deploy your backend properly you will need to provide it with the correct env-variables. An example of these
can be found in the root folder in the file '.env.example'.

---

## Frontend

The frontend is built with [Vue](https://vuejs.org/) and [Nuxt](https://nuxt.com/). For details on the code and
implementation, see the [frontend pages](insert here).

Deployment instructions for the frontend are available [here](insert here). Under normal circumstances, the frontend
requires no extra setup and should work out of the box after following the general deployment steps below.

---

## General Deployment

Once the database is configured and the backend environment variables are set, you're ready to deploy.

**Prerequisites:**

- [Node.js / npm](https://nodejs.org/)
- [pm2](https://pm2.keymetrics.io/) – process manager (`npm install -g pm2`)

With those installed, run the deployment script from the project root:

```bash
bash server/server_deployment.sh
```

This script will automatically build and deploy both the backend and frontend. By default, they are served on:

- **Backend:** port `3000`
- **Frontend:** port `3001`

---

## Nginx

To make the deployed services accessible, use the provided Nginx configuration found in the `server/` folder. Copy it to
the appropriate location:

```bash
sudo cp server/<config_file> /etc/nginx/sites-enabled/<your-name>
```

Alternatively, you can write your own Nginx configuration. The provided config includes the following out of the box:

- **API** is only accessible within the local network under the `/api` path.
- **Frontend** is served over both HTTP and HTTPS under the `/archive` path.
- **Admin page** (at `/admin`) is IP-locked and only accessible from within the local network.
- Requests to `/` are automatically redirected to `/archive`.

You can modify the provided config to add or remove any of these features as needed.

### HTTPS / SSL Certificate

To enable HTTPS, obtain an SSL certificate using [Certbot](https://certbot.eff.org/):

```bash
sudo certbot --nginx -d <your-domain>
```

Certbot can automatically update your Nginx config with the certificate details, or you can update it manually. Once
done, your server should be fully accessible over HTTPS.
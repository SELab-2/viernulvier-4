# Server Overview

This project consists of several interconnected components that must be deployed and configured together on a server to
function correctly:

- **Database** – PostgreSQL
- **Backend/API** – NestJS
- **Frontend** – Vue + Nuxt

This page provides a brief structural overview and basic setup instructions. See the linked component pages for more
detailed information.

---

## Database

The database runs on [PostgreSQL](https://www.postgresql.org/download/). Install it on your server by
following [this guide](https://www.postgresql.org/download/), then restore the database from the provided dump:

> **Important:** you can choose to create a database in the install script (see section `General Deployment`). In such a
> case you can ignore this section and just make sure psql is running on port 5432.
>

```bash
pg_restore -U <username> -d <database_name> server/pg.dump
```

> **Note:** `<username>` and `<database_name>` refer to your PostgreSQL installation credentials.

The restored database includes an admin account and API key to get you started. Some additional configuration is still
required — please review the [database page](database.md) before proceeding.

---

## API / Backend

The backend is built with [NestJS](https://nestjs.com/). For in-depth documentation on its architecture and internals,
see the [backend overview page](insert here). For a step-by-step deployment guide, see
the [backend setup page](backend.md).

Before deploying, make sure to configure the required environment variables. An example can be found in `.env.example`
in the project root.

> **Note:** If you choose to use the `--init-db` flag in the `General Deployment` section then you need to fill the env
> vars in with the vars you will choose in the script. (before you run it!)

---

## Frontend

The frontend is built with [Vue](https://vuejs.org/) and [Nuxt](https://nuxt.com/). For implementation details, see
the [frontend pages](insert here).

Under normal circumstances, the frontend requires minimal setup and should work out of the box after following the
deployment steps below. See the [frontend page](frontend.md) if you run into issues.

---

## General Deployment

Once the database is configured and the backend environment variables are in order, you're ready to deploy.

**Prerequisites:**

- [Node.js / npm](https://nodejs.org/)
- [pm2](https://pm2.keymetrics.io/) (`npm install -g pm2`)

> You can choose to deploy the server in 2 different ways.

### Option 1: Standard Deployment

If you have already set up and restored your PostgreSQL database manually, run the standard deployment script from the
project root:

```bash
bash server/server_deployment.sh
```

### Option 2: Deploy & Initialize Database

If you have installed PostgreSQL but haven't created the database or imported the dump yet, run the script with the
`--init-db` flag.
It will securely prompt you for your PostgreSQL credentials, create the database, and import the dump automatically
before building the apps:

```bash
bash server/server_deployment.sh --init-db
```

> **Note:** This script does not provide a working api-key or account. You will need to set that up yourself.
> See [database](database.md).

Both commands will build and deploy the backend and frontend. Default pm2 ports (unless changed in the pm2 config):

- **Backend:** `3000`
- **Frontend:** `3001`

---

## Nginx

Use the provided Nginx config to make the services publicly accessible:

```bash
sudo cp server/nginx_config /etc/nginx/sites-enabled/<your-name>
```

You can also write your own config if preferred. The provided one includes:

- **API** – LAN-only, accessible under `/api`
- **Frontend** – served over HTTP and HTTPS under `/archive`
- **Media hosting** - served over HTTP and HTTPS under `/photos`
- **Root redirect** – `/` automatically redirects to `/archive`

### HTTPS / SSL

To enable HTTPS, obtain a certificate via [Certbot](https://certbot.eff.org/):

```bash
sudo certbot --nginx -d <your-domain>
```

Certbot can update your Nginx config automatically, or you can add the certificate details manually.
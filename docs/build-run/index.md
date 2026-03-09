# Build and Run Overview

This project is a monorepo managed with Turbo, containing backend (Typescript + NestJS), frontend (Vue + Nuxt 4), and common packages. Use the root-level scripts for overall project management.

## Prerequisites

- Node.js (version 18+ recommended)
- npm (version 11+ recommended, as per packageManager)

## Installation

From the repository root:

```bash
npm install         # or `npm i`
```

This installs dependencies for all workspaces (backend, frontend, common).

## Development

To run all services in development mode concurrently:

```bash
npm run start:dev
```

This starts the backend on `http://localhost:3000` and frontend on `http://localhost:3001` (check individual configs for ports).

## Production Build

To build all packages:

```bash
npm run build
```

This compiles TypeScript and generates production assets for backend and frontend.

## Running in Production

After building:

```bash
npm run start:prod
```

This runs the built backend and frontend in production mode.

## Testing

For detailed testing instructions, including unit tests, e2e tests, and coverage reports, refer to the [Backend Testing](../testing/backend.md) for the backend and [Frontend Testing](../testing/frontend.md) for the frontend.

## Additional Notes

- Individual package scripts are available in their respective `package.json` files.
- Use `turbo` directly for more control: `npx turbo build --filter=backend` to build only the backend.
- Ensure ports don't conflict; adjust in configs if needed.

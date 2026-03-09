# Frontend Build and Run

This section covers building and running the Nuxt.js frontend.

## Installation

From the repository root:

```bash
cd frontend
npm install         # or `npm i`
```

## Development

To run in development mode:

```bash
cd frontend
npm run start:dev
```

The app will be available at `http://localhost:3001`.

## Production Build

To build for production:

```bash
cd frontend
npm run build
```

This generates static files in `.output/`.

## Running in Production

After building:

```bash
cd frontend
npm run start:prod
```

Or generate static site:

```bash
cd frontend
npm run generate
npm run preview
```

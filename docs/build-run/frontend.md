# Frontend Build and Run

This section covers building and running the Nuxt.js frontend.

## Prerequisites

- Node.js (version 18+ recommended)
- npm or yarn

## Installation

From the repository root:

```bash
cd frontend
npm install
```

## Development

To run in development mode:

```bash
npm run start:dev
```

The app will be available at `http://localhost:3001`.

## Production Build

To build for production:

```bash
npm run build
```

This generates static files in `.output/`.

## Running in Production

After building:

```bash
npm run start:prod
```

Or generate static site:

```bash
npm run generate
npm run preview
```

## Additional Commands

- `npm run test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage
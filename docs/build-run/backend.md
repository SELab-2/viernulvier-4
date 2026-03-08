# Backend Build and Run

This section explains how to build and run the NestJS backend.

## Installation

From the repository root:

```bash
cd backend
npm install
```

## Development

To run in development mode with hot reload:

```bash
cd backend
npm run start:dev
```

The server will start on `http://localhost:3000` (or as configured).

## Production Build

To build for production:

```bash
cd backend
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Running in Production

After building:

```bash
cd backend
npm run start:prod
```

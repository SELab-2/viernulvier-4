# Backend Build and Run

This section explains how to build and run the NestJS backend.

## Prerequisites

- Node.js (version 18+ recommended)
- npm or yarn

## Installation

From the repository root:

```bash
cd backend
npm install
```

## Development

To run in development mode with hot reload:

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (or as configured).

## Production Build

To build for production:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

## Running in Production

After building:

```bash
npm run start:prod
```

## Debugging

For debug mode:

```bash
npm run start:debug
```

Attach a debugger (e.g., via VS Code) to port 9229.

## Additional Commands

- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

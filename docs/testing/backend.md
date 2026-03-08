# Backend Testing

This section covers how to run and interpret tests for the backend (NestJS) project.

## Running tests

From the repository root:

```bash
cd backend
npm install           # ensure dependencies are installed
npm run test          # runs Jest unit tests
```

## Running end‑to‑end tests

```bash
cd backend
npm run test:e2e     # execute integration/e2e tests
```

## Coverage reports

The Jest run generates a coverage report in `backend/coverage`. Open `backend/coverage/lcov-report/index.html` in a browser to view.

The repo also tracks coverage output under `coverage/` at the project root.

You can also check the coverage by running:

```bash
cd backend
npm run test:coverage
```

## Tips

- Use `npm run test:watch` during development for auto-rerun on file changes.
- Tests are located alongside their implementation (`*.spec.ts`) in each module.

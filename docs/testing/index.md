# Testing Overview

This project uses different testing frameworks for each package within the monorepo. This section guides you through running tests across the entire project or focusing on specific packages.

## Running All Tests

From the repository root, run tests across all packages:

```bash
npm run test
```

For coverage reports across all packages:

```bash
npm run test:coverage
```

## Backend Testing

The backend (NestJS) uses **Jest** as the testing framework.

- **Unit Tests**: Run `npm run test` in the `backend/` folder
- **End-to-End Tests**: Run `npm run test:e2e` to test API integration
- **Coverage Reports**: Available in `backend/coverage/lcov-report/`

For detailed instructions, see [Backend Testing](backend.md).

## Frontend Testing

The frontend (Nuxt + Vue) uses **Vitest** for unit testing.

- **Unit Tests**: Run `npm run test` in the `frontend/` folder
- **Coverage Reports**: Available in `frontend/coverage/`

For detailed instructions, see [Frontend Testing](frontend.md).

## Coverage Reports

After running tests with coverage, HTML reports are generated:

- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend/coverage/lcov-report/index.html`

Open these in a browser to view detailed coverage metrics.

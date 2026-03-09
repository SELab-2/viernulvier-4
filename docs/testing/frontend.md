# Frontend Testing

This section describes how to run and review tests for the Nuxt/Vue frontend.

## Running tests

```bash
cd frontend
npm install     # or `npm i`
npm run test    # vitest configured via `vitest.config.ts`
```

## Running end‑to‑end tests (if available)

The front-end does not currently include e2e tests.

## Coverage

Vitest outputs coverage if you enable it in `vitest.config.ts` (already configured for `frontend`).  
Run:

```bash
npm run test:coverage
```

and view the HTML report under `frontend/coverage`.

To exclude a file or directory from the coverage, add it to the `coverage.exclude` list in `frontend/vitest.config.ts`

## General notes

* The `frontend/package.json` defines several helpful scripts (`dev`, `build`, `preview`, etc.).
* To see live feedback while editing components, run `npm run dev` and open the browser.

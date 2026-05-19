**Frontend — Nuxt Overview**

This document describes the Nuxt (Nuxt 3) structure and naming conventions used by this repository, and maps the `frontend` folder layout to its purpose.

**Nuxt Structure & Naming**

- **`app/` directory:** Nuxt 3-style application directory. Contains application entry points such as pages, layouts, components and composables. Files here are auto-discovered by Nuxt.
- **Pages & routing:** Files under `app/pages` map to routes. Use `index.vue` for directory default routes and bracketed names for dynamic segments, e.g. `app/pages/productions/[id].vue` → route `/productions/:id`.
- **Layouts:** Place reusable page layouts in `app/layouts`. Layout files define the outer shell for pages and are referenced by the `layout` property in page components.
- **Components:** Put Vue components in `app/components`. Prefer consistent component naming (PascalCase for component names) and avoid global side-effects. Components are auto-registered by Nuxt if placed here.
- **Composables:** Put reusable composition functions in `app/composables` (`useXyz` naming convention). These are auto-imported across the app.
- **Plugins:** Add client/server plugins in `plugins/` (or `app/plugins`) when you need to extend Nuxt/Vue at runtime.
- **Server / API routes:** Use the `server/` folder for route handlers or server logic (Nitro server). Files under `server/api` become backend endpoints.
- **Static assets & public:** Use `public/` for files served as-is (favicons, robots.txt). Use `app/assets` (or project `assets`) for webpack-processed assets.
- **Configuration:** `nuxt.config.ts` holds the application configuration (modules, runtime config, build options, route rules).

**Common naming conventions**

- Pages: `kebab-case` or `camelCase` for directories; dynamic segments with `[param]`.
- Components: `PascalCase.vue` filenames for components exported as default (e.g., `MyCard.vue`).
- Auto-registered component names: Nuxt derives a component's registered name from its file path by concatenating directory names and the filename and converting to PascalCase. For example, `app/components/admin/Component.vue` is registered as `AdminComponent`, and `app/components/admin/user/Profile.vue` becomes `AdminUserProfile`. To control the name explicitly, add a `name` field to the component's default export.
- Composables: `useSomething.ts` or `useSomething.ts` in `app/composables`.
- Composables/ composable functions should start with `use` and be side-effect free where possible.

**Frontend Folder Overview (this repo)**

Top-level entries in the `frontend` folder and their purpose:

- **`.nuxt/`, `.output/`, `dist/`**: Build output and runtime artifacts. Ignore in source control.
- **`app/`**: The application source (pages, components, layouts). Key subfolders:
    - `app/pages/` — route components (example: `app/pages/productions/[id].vue`).
    - `app/components/` — Vue components used by pages.
    - `app/layouts/` — layout wrappers.
    - `app/composables/` — reusable composition functions.
- **`public/`**: Static files served at project root.
- **`locales/`**: Translation files for i18n.
- **`server/`**: Nitro backend functions and API endpoints used by the frontend.
- **`tests/`**: Frontend unit / integration tests (vitest).
- **`nuxt.config.ts`**: Nuxt configuration for this app.
- **`package.json`, `tsconfig.json`, `vitest.config.ts`**: Tooling and build/test configuration.

**Quick how-routes-are-derived**

- `app/pages/index.vue` → `/`
- `app/pages/blog/index.vue` → `/blog`
- `app/pages/productions/[id].vue` → `/productions/:id`

**Where to add things**

- New pages: create a file under `app/pages/`.
- New components: add `MyComponent.vue` under `app/components/`.
- New composables: add `useXyz.ts` under `app/composables/`.
- New server endpoints: add files under `server/api/`.

**Notes & Best Practices**

- Prefer the `app/` directory for Nuxt 3 projects; it enables auto-imports and opinionated routing.
- Keep pages thin: move logic to composables and components.
- Keep `nuxt.config.ts` as the central place for registering modules and global settings.

---

File created: `frontend/nuxt.config.ts` and `app/` are the authoritative sources for behavior in this app.

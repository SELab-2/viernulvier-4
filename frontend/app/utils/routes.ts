/**
 * All frontend page route paths.
 * Use these with navigateTo() or <NuxtLink> instead of hardcoding strings in components.
 *
 * Note: these are frontend routes, not backend API endpoints.
 * For backend endpoints see apiRoutes.ts.
 */
export const ROUTES = {
  home: {
    base: "/",
  },
  productions: {
    base: "/productions",
    byId: (id: number) => `/productions/${id}`,
  },
  stories: {
    base: "/stories",
    byId: (id: number) => `/stories/${id}`,
  },
  events: {
    base: "/events",
  },
  series: {
    base: "/series",
    byId: (id: number) => `/series/${id}`,
  },
  prints: {
    base: "/prints",
  },
  admin: {
    login: {
      base: "/admin/login",
    },
    dashboard: {
      base: "/admin",
    },
    productions: {
      base: "/admin/productions",
      byId: (id: number) => `/admin/productions/${id}`,
      create: "/admin/productions/create",
      edit: (id: number) => `/admin/productions/edit/${id}`,
      editTags: "/admin/productions/editTags",
      csvImports: "/admin/productions/csv-imports",
    },
    series: {
      base: "/admin/series",
    },
    stories: {
      base: "/admin/stories",
      create: "/admin/stories/create",
      edit: (id: number) => `/admin/stories/edit/${id}`,
    },
    events: {
      base: "/admin/events",
      create: "/admin/events/create",
      edit: (id: number) => `/admin/events/edit/${id}`,
    },
    prints: {
      base: "/admin/prints",
      create: "/admin/prints/create",
      edit: (id: number) => `/admin/prints/edit/${id}`,
    },
    accounts: {
      base: "/admin/accounts",
    },
  },
} as const;

export const ROUTES = {
  home: {
    base: "/home"
  },
  productions: {
    base: "/productions",
    byId: (id: number) => `/productions/${id}`,
    create: "/productions/create",
    edit: (id: number) => `/productions/edit/${id}`,
    editTags: "/productions/editTags",
  },
  stories: {
    base: "/stories",
    byId: (id: number) => `/stories/${id}`,
    create: "/stories/create",
    edit: (id: number) => `/stories/edit/${id}`,
  },
  events: {
    base: "/events",
    create: "/events/create",
    edit: (id: number) => `/events/edit/${id}`,
  },
  prints: {
    base: "/prints",
    create: "/prints/create",
  },
  accounts: {
    base: "/accounts",
  },
  login: {
    base: "/login",
  },
} as const
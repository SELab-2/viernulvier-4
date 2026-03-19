/**
 * All backend API endpoint paths.
 * Used by the specific composables (e.g. useProductionApi) — never reference these directly in pages or components.
 *
 * Base URL is not included here — it's read from runtimeConfig in useApi.
 */
export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    base: "/auth",
    byId: (accountId: number) => `/auth/${accountId}`,
  },
  productions: {
    base: "/productions",
    byId: (productionId: number) => `/productions/${productionId}`,
    tags: (productionId: number) => `/productions/${productionId}/tags`,
    tagById: (productionId: number, tagId: number) => `/productions/${productionId}/tags/${tagId}`,
    blogs: (productionId: number) => `/productions/${productionId}/blogs`,
    blogById: (productionId: number, blogId: number) => `/productions/${productionId}/blogs/${blogId}`,
  },
  events: {
    base: "/events",
    byId: (eventId: number) => `/events/${eventId}`,
    locations: (eventId: number) => `/events/${eventId}/location`,
    locationById: (eventId: number, locationId: number) => `/events/${eventId}/location/${locationId}`,
    prices: (eventId: number) => `/events/${eventId}/prices`,
    priceById: (eventId: number, priceId: number) => `/events/${eventId}/prices/${priceId}`,
  },
  blogs: {
    base: "/blogs",
    byId: (blogId: number) => `/blogs/${blogId}`,
  },
  tags: {
    base: "/tags",
    byId: (tagId: number) => `/tags/${tagId}`,
  },
  locations: {
    base: "/locations",
    byId: (locationId: number) => `/locations/${locationId}`,
  },
  prices: {
    base: "/prices",
    byId: (priceId: number) => `/prices/${priceId}`,
  },
} as const;

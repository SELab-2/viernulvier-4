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
  series: {
    base: "/series",
    byId: (seriesId: number) => `/series/${seriesId}`,
    productions: (seriesId: number) => `/series/${seriesId}/productions`,
    productionById: (seriesId: number, productionId: number) =>
      `/series/${seriesId}/productions/${productionId}`,
  },
  productions: {
    base: "/productions",
    byId: (productionId: number) => `/productions/${productionId}`,
    tags: (productionId: number) => `/productions/${productionId}/tags`,
    tagById: (productionId: number, tagId: number) =>
      `/productions/${productionId}/tags/${tagId}`,
    blogs: (productionId: number) => `/productions/${productionId}/blogs`,
    blogById: (productionId: number, blogId: number) =>
      `/productions/${productionId}/blogs/${blogId}`,
    media: (productionId: number) => `/productions/${productionId}/media`,
    mediaById: (productionId: number, galleryId: number) =>
      `/productions/${productionId}/media/${galleryId}`,
  },
  events: {
    base: "/events",
    byId: (eventId: number) => `/events/${eventId}`,
    locations: (eventId: number) => `/events/${eventId}/location`,
    locationById: (eventId: number, locationId: number) =>
      `/events/${eventId}/location/${locationId}`,
    prices: (eventId: number) => `/events/${eventId}/prices`,
    priceById: (eventId: number, priceId: number) =>
      `/events/${eventId}/prices/${priceId}`,
  },
  blogs: {
    base: "/blogs",
    byId: (blogId: number) => `/blogs/${blogId}`,
    media: (blogId: number) => `/blogs/${blogId}/media`,
    mediaById: (blogId: number, galleryId: number) =>
      `/blogs/${blogId}/media/${galleryId}`,
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
  parser: {
    productions: "/parser/productions",
    events: "/parser/events",
    tags: "/parser/tags",
    blogs: "/parser/blogs",
    prices: "/parser/prices",
  },
  galleries: {
    base: "/media/galleries",
    byId: (galleryId: number) => `/media/galleries/${galleryId}`,
    items: (galleryId: number) => `/media/galleries/${galleryId}/items`,
    itemLink: (galleryId: number, itemId: number) =>
      `/media/galleries/${galleryId}/items/${itemId}`,
  },
  items: {
    base: "/media/items",
    byId: (itemId: number) => `/media/items/${itemId}`,
    crops: (itemId: number) => `/media/items/${itemId}/crops`,
    cropLink: (itemId: number, cropId: number) =>
      `/media/items/${itemId}/crops/${cropId}`,
  },
  prints: {
    base: "/prints",
    byId: (printId: number) => `/prints/${printId}`,
  },
  crops: {
    base: "/media/crops",
    byId: (cropId: number) => `/media/crops/${cropId}`,
  },
  storage: {
    base: "/media/storage",
  },
} as const;

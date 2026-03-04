// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Disable Server-Side Rendering since we'll have a separate backend.
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000",
    },
  },
  app: {
    // don't touch this without asking @Seb first. baseURL must not be altered without knowing what you are doing.
    baseURL: process.env.NUXT_BASE || "/",
  },
});

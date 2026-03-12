// https://nuxt.com/docs/api/configuration/nuxt-config
// don't touch this without asking @Seb first. baseURL and apiBase must not be altered without knowing what you are doing.
// If you alter anything and you break Nuxt on the server then I will make you clean up the mess.
export default defineNuxtConfig({
  ssr: false, // Disable Server-Side Rendering since we'll have a separate backend.
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE || "http://localhost:3000",
    },
  },
  app: {
    baseURL: process.env.NUXT_BASE || "/",
  },
});

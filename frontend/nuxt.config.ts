// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // Disable Server-Side Rendering since we'll have a separate backend.
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'nl', language: 'nl-BE', file: 'nl.json', name: 'Nederlands' },
      { code: 'en', language: 'en-GB', file: 'en.json', name: 'English' },
    ],
    defaultLocale: 'nl',
    langDir: 'locales/',
    restructureDir: '',
    strategy: 'no_prefix', // no /nl/ or /en/ in URL
  },

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3000",
    },
  },
  app: {
    // don't touch this without asking @Seb first. baseURL must not be altered without knowing what you are doing.
    baseURL: process.env.NUXT_BASE || "/",
    head: {
      title: 'Viernulvier-Archive', 
      link: [
        { rel: 'icon', type: 'image/png', href: '/blue_black_reg.png' }
      ]
    }
  },
  css: ['~/assets/css/tailwind.css'],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
});

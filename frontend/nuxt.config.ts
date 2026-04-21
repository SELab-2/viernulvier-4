// https://nuxt.com/docs/api/configuration/nuxt-config
// don't touch this without asking @Seb first. baseURL and apiBase must not be altered without knowing what you are doing.
// If you alter anything and you break Nuxt on the server then I will make you clean up the mess.
export default defineNuxtConfig({
  ssr: false, // Disable Server-Side Rendering since we'll have a separate backend.
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/i18n"],
  i18n: {
    locales: [
      { code: "nl", language: "nl-BE", file: "nl.json", name: "Nederlands" },
      { code: "en", language: "en-GB", file: "en.json", name: "English" },
    ],
    defaultLocale: "nl",
    langDir: "locales/",
    restructureDir: "",
    strategy: "no_prefix", // no /nl/ or /en/ in URL
  },
  devServer: {
    port: 3001,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_API_BASE || "http://localhost:3000",
      mediaBaseUrl: process.env.MEDIA_BASE_URL || "http://localhost",
    },
  },
  app: {
    baseURL: process.env.NUXT_BASE || "/",
    head: {
      title: "Viernulvier-Archive",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: `${process.env.NUXT_BASE || "/"}favicon.png`,
        },
      ],
    },
  },
  css: ["~/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'lucide-vue-next',
        'zod',
        'pdfjs-dist',
        '@vueuse/core',
      ]
    }
  }
});

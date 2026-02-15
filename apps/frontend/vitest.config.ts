import { defineVitestConfig } from "@nuxt/test-utils/config"

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: "./"
      }
    },
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "lcov"],
      include: ["**/*.vue"],

      // TODO: Bespreek welke percentage we dit willen hebben
      // thresholds: {
      //   lines: 70
      // }
    },
  }
})

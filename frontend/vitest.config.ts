import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        rootDir: "./",
      },
    },
    globals: true,

    onConsoleLog(log) {
      // 1. Kill Nuxt's Suspense warning
      if (log.includes("<Suspense> is an experimental feature")) return false;

      // 2. Kill Vue Router missing path warnings
      if (log.includes("No match found for location with path")) return false;

      // 3. Kill the Vitest 4.1 deprecation warning (Nuxt's fault)
      if (log.includes('Importing from "vitest/environments" is deprecated'))
        return false;

      // Let everything else print normally
    },

    include: ["tests/**/*.spec.ts", "app/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "lcov"],
      include: ["app/**/*.vue", "app/composables/**/*.ts"],

      // Fail tests if global coverage under 70%
      thresholds: {
        lines: 70,
      },
    },
  },
});

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
      if (log.includes("<Suspense> is an experimental feature")) return false;

      if (log.includes("No match found for location with path")) return false;
      if (log.includes('Importing from "vitest/environments" is deprecated'))
        return false;

      if (log.includes("[useApi] Network error")) return false;
      if (log.includes("[useApi] Not Found")) return false;
      if (log.includes("fetch failed")) return false;
      if (log.includes("handleDefaultError")) return false;
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

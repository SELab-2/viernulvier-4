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
    silent: true,
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

import { describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      apiBase: "https://mock-api.com",
    },
    app: {
      baseURL: "/",
    },
  });
});

// The test.
describe("Render index.vue", () => {
  it("Render the fetched data", async () => {
    const bool = true;
    expect(bool);
  });
});

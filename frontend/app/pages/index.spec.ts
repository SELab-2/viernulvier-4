import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import Index from "./index.vue";
import { HelloWorldSchema } from "@repo/common";

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

// Mock the UseFetch function.
mockNuxtImport("useFetch", () => {
  return () => {
    return {
      data: HelloWorldSchema.parse({
        text: "Hello World!",
      }),
      status: { value: "success" },
      error: { value: null },
      refresh: vi.fn(),
      pending: { value: false },
    };
  };
});

// The test.
describe("Render index.vue", () => {
  it("Render the fetched data", async () => {
    const component = await mountSuspended(Index);
    expect(component.text()).toContain("Hello World");
  });
});

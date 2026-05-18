import type { Mock } from "vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ArchivePage from "../../app/pages/productions/index.vue";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn() as Mock,
  routerReplace: vi.fn() as Mock,
}));

// Mock the router to prevent Nuxt internal errors and track navigation
mockNuxtImport("useRouter", () => () => ({
  push: mocks.routerPush,
  replace: mocks.routerReplace,
  resolve: vi.fn(() => ({ href: "/archive" })),
  beforeResolve: vi.fn(),
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  onError: vi.fn(),
  currentRoute: { value: { query: {} } },
}));

describe.skip("Archive Overview Page (Structural & Routing)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders correctly and composes all layout sections", async () => {
    const wrapper = await mountSuspended(ArchivePage, {
      global: {
        stubs: {
          ArchiveHeader: true,
          ArchiveSearchSection: true,
          ArchiveBody: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: "ArchiveHeader" }).exists()).toBe(
      true,
    );
    expect(
      wrapper.findComponent({ name: "ArchiveSearchSection" }).exists(),
    ).toBe(true);
    expect(wrapper.findComponent({ name: "ArchiveBody" }).exists()).toBe(true);
  });

  test("updates URL query parameters when search section emits an update", async () => {
    const wrapper = await mountSuspended(ArchivePage, {
      global: {
        stubs: {
          ArchiveHeader: true,
          ArchiveSearchSection: true,
          ArchiveBody: true,
        },
      },
    });

    const searchSection = wrapper.findComponent({
      name: "ArchiveSearchSection",
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    searchSection.vm.$emit("update-search", { query: "theatre" });

    // Verify the parent wrapper correctly calls the router
    expect(mocks.routerReplace).toHaveBeenCalledWith("/");
  });
});

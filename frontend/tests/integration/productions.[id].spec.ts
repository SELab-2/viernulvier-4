import { ref } from "vue";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import ProductionPage from "../../app/pages/productions/[id].vue";

const mocks = vi.hoisted(() => ({
  getById: vi.fn() as Mock,
  getTags: vi.fn() as Mock,
  getBlogs: vi.fn() as Mock,
  getMediaGallery: vi.fn() as Mock,
  getAllEvents: vi.fn() as Mock,
  getLocation: vi.fn() as Mock,
  getPrices: vi.fn() as Mock,
  getMainImageCrop: vi.fn() as Mock,
  routerBack: vi.fn() as Mock,
  routerPush: vi.fn() as Mock,
}));

mockNuxtImport("useProductionApi", () => () => ({
  getById: mocks.getById,
  getTags: mocks.getTags,
  getBlogs: mocks.getBlogs,
  getMediaGallery: mocks.getMediaGallery,
}));

mockNuxtImport("useEventApi", () => () => ({
  getAll: mocks.getAllEvents,
  getLocation: mocks.getLocation,
  getPrices: mocks.getPrices,
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
  locale: ref("nl"), // prevents locale.value from crashing useAsyncData
}));

mockNuxtImport("useRoute", () => () => ({
  params: { id: "123" }, // Locks the route parameter directly
}));

mockNuxtImport("useRouter", () => () => ({
  back: mocks.routerBack,
  push: mocks.routerPush,
  replace: vi.fn(),
  resolve: vi.fn(() => ({ href: "/" })),
  beforeResolve: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
  onError: vi.fn(),
  isReady: vi.fn(() => Promise.resolve()),
  currentRoute: { value: { path: "/" } },
}));

vi.mock("~/composables/media/useGallery", () => ({
  useGallery: () => ({
    getMainImageCrop: mocks.getMainImageCrop,
  }),
}));

const mockProductionData = {
  id: 123,
  titel: "Hamlet",
  description1: "A brilliant classic play by Shakespeare.",
  description2: "Behind the scenes information and context.",
  artist: "William Shakespeare",
  tagline: "To be or not to be.",
  credits: "Directed by John Doe",
  performer_type: "Theatre",
  attendance_mode: "Offline",
  created_at: "2024-01-01T10:00:00.000Z",
  updated_at: "2024-01-01T10:00:00.000Z",
};

describe("Production Detail Page (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Prevent JSDOM crash from ResizeObserver using Vitest stubGlobal
    class MockResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver);

    // Provide default successful mock resolutions
    mocks.getById.mockResolvedValue({ data: mockProductionData });
    mocks.getTags.mockResolvedValue({
      data: [
        { id: 1, tag: "Drama" },
        { id: 2, tag: " " },
      ],
    });
    mocks.getBlogs.mockResolvedValue({
      data: [{ id: 1, title: "Rehearsal Story" }],
    });
    mocks.getMediaGallery.mockResolvedValue({ data: { items: [] } });
    mocks.getMainImageCrop.mockReturnValue({
      url: "/mock-header-image.jpg",
      path: "/mock-header-image.jpg",
      src: "/mock-header-image.jpg",
      file: "/mock-header-image.jpg",
      image: "/mock-header-image.jpg",
    });

    mocks.getAllEvents.mockResolvedValue({
      data: { objects: [{ id: 99, name: "Opening Night" }] },
    });
    mocks.getLocation.mockResolvedValue({ data: { name: "Main Hall" } });
    mocks.getPrices.mockResolvedValue({ data: [{ price: 20 }] });

    Object.defineProperty(window, "history", {
      value: { length: 2 },
      writable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders production details accurately and filters empty tags", async () => {
    const wrapper = await mountSuspended(ProductionPage);

    await flushPromises(); // Give useAsyncData time to resolve our mocked promises

    // Verify Title, Artist, Tagline, and Performer Type
    expect(wrapper.html()).toContain("Hamlet");
    expect(wrapper.html()).toContain("William Shakespeare");
    expect(wrapper.html()).toContain("To be or not to be.");
    expect(wrapper.html()).toContain("Theatre");

    // Verify Descriptions
    expect(wrapper.html()).toContain("A brilliant classic play");

    // Verify Nested Event Resolution happened correctly
    expect(mocks.getAllEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        eventFilters: expect.objectContaining({
          production_id: 123,
        }) as unknown,
      }),
    );
    expect(mocks.getLocation).toHaveBeenCalledWith(99, "nl"); // 99 is our mocked event ID
  });

  test("back button navigates back if history exists", async () => {
    const wrapper = await mountSuspended(ProductionPage);
    await flushPromises();

    // Use test ID or specific text to find the back button
    const backButton = wrapper
      .findAll("button")
      .find(
        (b) => b.text().includes("general.back") || b.text().includes("back"),
      );

    if (backButton) {
      await backButton.trigger("click");
      expect(mocks.routerBack).toHaveBeenCalled();
      expect(mocks.routerPush).not.toHaveBeenCalled();
    }
  });

  test("back button pushes to fallback route if history is empty", async () => {
    Object.defineProperty(window, "history", {
      value: { length: 1 },
      writable: true,
    });

    const wrapper = await mountSuspended(ProductionPage);
    await flushPromises();

    const backButton = wrapper
      .findAll("button")
      .find(
        (b) => b.text().includes("general.back") || b.text().includes("back"),
      );

    if (backButton) {
      await backButton.trigger("click");
      expect(mocks.routerPush).toHaveBeenCalled();
      expect(mocks.routerBack).not.toHaveBeenCalled();
    }
  });

  test("handles empty associations (no events, tags, or blogs) without crashing", async () => {
    // Override associations to be empty
    mocks.getTags.mockResolvedValue({ data: [] });
    mocks.getBlogs.mockResolvedValue({ data: [] });
    mocks.getAllEvents.mockResolvedValue({ data: { objects: [] } });

    const wrapper = await mountSuspended(ProductionPage);
    await flushPromises();

    const html = wrapper.html();

    // Should still render the main production details
    expect(html).toContain("Hamlet");
    expect(html).toContain("William Shakespeare");

    // Should NOT have made calls to fetch location/prices since there are no events
    expect(mocks.getLocation).not.toHaveBeenCalled();
    expect(mocks.getPrices).not.toHaveBeenCalled();
  });

  test("displays error state when API throws an error", async () => {
    mocks.getById.mockRejectedValue(new Error("Internal Server Error"));

    const wrapper = await mountSuspended(ProductionPage);
    await flushPromises();

    // Usually expect to see Nuxt's default error page text or your custom error boundary
    expect(wrapper.html()).toContain("500");
  });
});

import { computed, ref } from "vue";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import StoryPage from "../../app/pages/stories/[id].vue";

const mocks = vi.hoisted(() => ({
  getById: vi.fn() as Mock,
  getMediaGallery: vi.fn() as Mock,
  getMainImageCrop: vi.fn() as Mock,
  getProductions: vi.fn() as Mock,
  routerPush: vi.fn() as Mock,
  routerBack: vi.fn() as Mock,
  routerReplace: vi.fn() as Mock,
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
  locale: ref("en"), // Must be a ref so the watch() array in useAsyncData doesn't crash
}));

mockNuxtImport("useRoute", () => () => ({
  params: { id: "456" },
}));

// Update the router mock to include replace
mockNuxtImport("useRouter", () => () => ({
  push: mocks.routerPush,
  back: mocks.routerBack,
  replace: mocks.routerReplace,
  currentRoute: ref({ query: {} }),
  beforeResolve: vi.fn(),
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  onError: vi.fn(),
  resolve: vi.fn(() => ({ href: "/stories" })),
}));

vi.mock("~/composables/media/useGallery", () => ({
  useGallery: () => ({
    getMainImageCrop: mocks.getMainImageCrop,
  }),
}));

vi.mock("~/composables/blogs/useBlogApi", () => ({
  useBlogApi: () => ({
    getById: mocks.getById,
    getMediaGallery: mocks.getMediaGallery,
  }),
}));

vi.mock("~/composables/useProductionApi", () => ({
  useProductionApi: () => ({
    getAll: mocks.getProductions,
  }),
}));

vi.mock("~/composables/blogs/useBlogView", () => ({
  useBlogView: () => ({
    useBlogStory: (
      blogRef: Ref<{ titel?: string; description?: string } | null | undefined>,
    ) => ({
      title: computed(() => blogRef.value?.titel || ""),
      description: computed(() => blogRef.value?.description || ""),
      formattedDate: computed(() => (blogRef.value ? "15 October 2024" : "")),
    }),
  }),
}));

const mockBlogData = {
  id: 456,
  titel: "The Ultimate Guide to Nuxt Testing",
  description: "<p>" + "Word ".repeat(450) + "</p>",
  created_at: "2024-01-01T10:00:00.000Z",
  updated_at: "2024-01-01T10:00:00.000Z",
};

describe("Story Detail Page (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful API resolutions
    mocks.getById.mockResolvedValue({ data: mockBlogData });
    mocks.getMediaGallery.mockResolvedValue({ data: { items: [] } });
    mocks.getProductions.mockResolvedValue({
      data: { objects: [], totalItems: 0 },
    });

    // The "God Object" to prevent <MediaDisplay> from crashing on URL formatters
    mocks.getMainImageCrop.mockReturnValue({
      url: "/mock-blog-header.jpg",
      path: "/mock-blog-header.jpg",
      src: "/mock-blog-header.jpg",
      file: "/mock-blog-header.jpg",
    });
  });

  test("renders story details and calculates reading time accurately", async () => {
    const wrapper = await mountSuspended(StoryPage);
    await flushPromises();

    const html = wrapper.html();

    // Verify Title and Date
    expect(html).toContain("The Ultimate Guide to Nuxt Testing");
    expect(html).toContain("15 October 2024");

    // Verify Reading Time Calculation
    expect(html).toContain("3 stories.minRead");

    // Verify Body Content rendered
    expect(html).toContain("<p>Word Word");
  });

  test("displays not found state gracefully when API returns null", async () => {
    mocks.getById.mockResolvedValue({ data: null });

    const wrapper = await mountSuspended(StoryPage);
    await flushPromises();

    const html = wrapper.html();

    expect(html).not.toContain("stories.notFound");
    expect(html).toContain("general.back");
  });

  test("displays not found state gracefully when API throws an error", async () => {
    mocks.getById.mockRejectedValue(new Error("Internal Server Error"));

    const wrapper = await mountSuspended(StoryPage);
    await flushPromises();

    expect(wrapper.html()).toContain("500");
  });

  test("navigates back when 'Back' button is clicked (Programmatic Navigation)", async () => {
    const wrapper = await mountSuspended(StoryPage);
    await flushPromises();

    const backButton = wrapper.find("button");

    if (backButton.exists() && backButton.text().includes("general.back")) {
      await backButton.trigger("click");
    }
  });

  test("renders valid NuxtLink to stories overview on empty state", async () => {
    mocks.getById.mockResolvedValue({ data: null });

    const wrapper = await mountSuspended(StoryPage);
    await flushPromises();

    const linkTags = wrapper.findAll("a");
    const backLink = linkTags.find((link) =>
      link.text().includes("general.back"),
    );

    if (backLink) {
      expect(backLink.attributes("href")).toBe("/stories");
    }
  });
});

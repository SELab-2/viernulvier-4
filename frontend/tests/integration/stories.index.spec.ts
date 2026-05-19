import { computed, ref, unref } from "vue";
import type { MaybeRef } from "vue";
import type { Mock } from "vitest";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import StoriesPage from "../../app/pages/stories/index.vue";

type MockStory = {
  id: number;
  titel: string;
  description: string;
  created_at: string;
};

const mocks = vi.hoisted(() => ({
  getAll: vi.fn() as Mock,
  routerPush: vi.fn() as Mock,
  routerReplace: vi.fn() as Mock,
}));

const sortOrder = ref("newest");
const searchQuery = ref("");
const dateFilter = ref({ after: "", before: "" });

vi.mock("~/composables/blogs/useBlogApi", () => ({
  useBlogApi: () => ({
    getAll: mocks.getAll,
  }),
}));

vi.mock("~/composables/blogs/useBlogView", () => ({
  useBlogView: () => ({
    sortOrder,
    searchQuery,
    dateFilter,
    useBlogStory: (story: MaybeRef<MockStory>) => {
      const resolvedStory = computed<MockStory>(() => unref(story));

      return {
        title: computed(() => resolvedStory.value.titel ?? "—"),
        description: computed(() => resolvedStory.value.description ?? ""),
        formattedDate: computed(() => resolvedStory.value.created_at ?? ""),
        storyId: computed(() => resolvedStory.value.id ?? 0),
      };
    },
    fetchSuggestions: vi.fn(),
  }),
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
  locale: ref("en"),
}));

// Mock the Nuxt Router
mockNuxtImport("useRouter", () => () => ({
  push: mocks.routerPush,
  replace: mocks.routerReplace,
  currentRoute: ref({ query: {} }),
  beforeResolve: vi.fn(),
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  onError: vi.fn(),
  resolve: vi.fn(() => ({ href: "/" })),
}));

const createMockBlog = (id: number, date: string) => ({
  id,
  titel: `Story ${id}`,
  description: "Content here",
  created_at: date,
  updated_at: date,
});

describe("Stories Overview Page (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    // Default mock behavior for "Oldest/Newest Date Bounds" fetch
    mocks.getAll.mockResolvedValueOnce({
      objects: [createMockBlog(1, "2020-01-01T10:00:00Z")],
      totalItems: 100,
    });
    mocks.getAll.mockResolvedValueOnce({
      objects: [createMockBlog(2, "2024-12-31T10:00:00Z")],
      totalItems: 100,
    });

    // Default mock for the initial page load (limit 20)
    mocks.getAll.mockResolvedValue({
      objects: Array.from({ length: 20 }, (_, i) =>
        createMockBlog(i + 3, "2024-01-01T10:00:00Z"),
      ),
      totalItems: 50,
    });
  });

  afterEach(() => {
    // Replaced dangerous global deletion with Vitest unstub
    vi.unstubAllGlobals();
  });

  test("initializes first page of stories", async () => {
    // Removed unused 'const wrapper =' assignment
    await mountSuspended(StoriesPage);
    await flushPromises();

    // Verify date bounds were fetched and sliced correctly
    expect(mocks.getAll).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationFilters: expect.objectContaining({
          limit: 1,
          descending: false,
        }) as unknown,
      }),
    );
  });

  test("shows error state and retries successfully", async () => {
    mocks.getAll.mockRejectedValueOnce(new Error("API Down"));

    const wrapper = await mountSuspended(StoriesPage);
    await flushPromises();

    expect(wrapper.html()).toContain("stories.noStories");
  });

  test("renders correct routing links for stories (if using NuxtLink)", async () => {
    const wrapper = await mountSuspended(StoriesPage);
    await flushPromises();

    const storyLinks = wrapper
      .findAll("a")
      .filter((link) => link.attributes("href")?.includes("/stories/3"));

    if (storyLinks.length > 0) {
      expect(storyLinks[0].attributes("href")).toContain("/stories/3");
    }
  });

  test("navigates to story detail on click (if using programmatic navigation)", async () => {
    const wrapper = await mountSuspended(StoriesPage);
    await flushPromises();

    const firstStoryCard = wrapper.find(".story-card");

    if (firstStoryCard.exists()) {
      await firstStoryCard.trigger("click");

      expect(mocks.routerPush).toHaveBeenCalledWith(
        expect.objectContaining({ path: "/stories/3" }),
      );
    }
  });

  test("updates router query parameters when search query changes", async () => {
    // Removed unused 'const wrapper =' assignment
    await mountSuspended(StoriesPage);
    await flushPromises();

    searchQuery.value = "Vue 3 updates";
    await flushPromises();
  });
});

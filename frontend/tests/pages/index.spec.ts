import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import HomePage from "../../app/pages/index.vue";

const productionQuery = ref("stale production");
const productionDate = ref<Record<string, string>>({ after: "2020-01-01" });
const tagIds = ref<number[]>([1, 2]);
const blogQuery = ref("stale blog");
const blogDate = ref<Record<string, string>>({ before: "2024-01-01" });
const printQuery = ref("stale print");
const activeFilter = ref<string | null>("poster");
const fetchSingleRandomImage = vi.fn();
const getAllTags = vi.fn();
const locale = ref("en");

mockNuxtImport("useArchiveView", () => () => ({
  searchQuery: productionQuery,
  dateFilter: productionDate,
  tagIds,
}));

mockNuxtImport("useI18n", () => () => ({
  locale,
  t: (key: string) => key,
}));

mockNuxtImport("useTagApi", () => () => ({
  getAll: getAllTags,
}));

vi.mock("../../app/composables/blogs/useBlogView", () => ({
  useBlogView: () => ({
    searchQuery: blogQuery,
    dateFilter: blogDate,
  }),
}));

vi.mock("../../app/composables/home/useHomeView", () => ({
  useHomeView: () => ({
    fetchSingleRandomImage,
  }),
}));

vi.mock("../../app/composables/media/usePrintView", () => ({
  usePrintView: () => ({
    searchQuery: printQuery,
    activeFilter,
  }),
}));

describe("home page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    productionQuery.value = "stale production";
    productionDate.value = { after: "2020-01-01" };
    tagIds.value = [1, 2];
    blogQuery.value = "stale blog";
    blogDate.value = { before: "2024-01-01" };
    printQuery.value = "stale print";
    activeFilter.value = "poster";
    locale.value = "en";
    fetchSingleRandomImage
      .mockResolvedValueOnce({ id: 1, url: "/hero-1.jpg" })
      .mockResolvedValueOnce({ id: 2, url: "/hero-2.jpg" })
      .mockResolvedValueOnce({ id: 3, url: "/hero-3.jpg" });
    getAllTags.mockResolvedValue({
      data: {
        objects: [
          { id: 1, tag: "Theatre" },
          { id: 2, tag: "N/A" },
          { id: 3, tag: "Dance" },
        ],
      },
    });
  });

  it("resets shared filters and renders the hero widgets", async () => {
    const wrapper = mount(HomePage, {
      global: {
        stubs: {
          MediaDisplay: { template: '<img data-test="media-display" />' },
          HomeSearchBar: { template: '<div data-test="home-search" />' },
          HomeRandomYears: { template: '<div data-test="home-years" />' },
          HomeTags: {
            props: ["tags"],
            template:
              '<div data-test="home-tags">{{ tags.map((tag) => tag.tag).join(",") }}</div>',
          },
        },
      },
    });

    await flushPromises();

    expect(productionQuery.value).toBe("");
    expect(productionDate.value).toEqual({});
    expect(tagIds.value).toEqual([]);
    expect(blogQuery.value).toBe("");
    expect(blogDate.value).toEqual({});
    expect(printQuery.value).toBe("");
    expect(activeFilter.value).toBeNull();
    expect(wrapper.text()).toContain("home.title");
    expect(wrapper.find('[data-test="home-search"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="home-years"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Theatre");
    expect(wrapper.text()).not.toContain("N/A");
  });

  it("preloads another image and advances the hero timer", async () => {
    mount(HomePage, {
      global: {
        stubs: {
          MediaDisplay: { template: '<img data-test="media-display" />' },
          HomeSearchBar: true,
          HomeRandomYears: true,
          HomeTags: true,
        },
      },
    });

    await flushPromises();
    expect(fetchSingleRandomImage).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(5000);
    await flushPromises();

    expect(fetchSingleRandomImage).toHaveBeenCalledTimes(3);
  });
});

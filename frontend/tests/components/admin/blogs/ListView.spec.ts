import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { ref } from "vue";
import ListView from "../../../../app/components/admin/blogs/ListView.vue";
import * as useBlogApiModule from "../../../../app/composables/blogs/useBlogApi";
import * as useBlogViewModule from "../../../../app/composables/blogs/useBlogView";

const mockSnackbarAdd = vi.fn();

vi.mock("vue3-snackbar", () => ({
  useSnackbar: () => ({
    add: mockSnackbarAdd,
  }),
}));

vi.mock("../../../../app/composables/blogs/useBlogApi", () => ({
  useBlogApi: vi.fn(),
}));

vi.mock("../../../../app/composables/blogs/useBlogView", () => ({
  useBlogView: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          new: "New story",
          fetchError: "Error fetching blogs",
          deleteConfirm: "Are you sure you want to delete {title}?",
          deleteSuccess: "Successfully deleted {title}",
          deleteError: "Error deleting blog",
        },
      },
      stories: {
        noStories: "No stories found",
        noStoriesDesc: "Try adjusting your filters",
      },
      general: {
        results: "results",
      },
    },
  },
});

describe("AdminBlogsListView", () => {
  const mockBlogApi = {
    getAll: vi.fn(),
    remove: vi.fn(),
  };

  const mockBlogView = {
    sortOrder: ref("newest"),
    searchQuery: ref(""),
    dateFilter: ref({ after: null, before: null }),
    fetchSuggestions: vi.fn(),
    locale: ref("en"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useBlogApiModule.useBlogApi as Mock).mockReturnValue(mockBlogApi);
    (useBlogViewModule.useBlogView as Mock).mockReturnValue(mockBlogView);

    mockBlogApi.getAll.mockResolvedValue({
      data: {
        objects: [],
        totalItems: 0,
      },
    });
  });

  it("renders correctly and fetches data on mount", async () => {
    mount(ListView, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: true,
          AdminBlogsStoriesSkeleton: true,
          BlogsStoryListItem: true,
          AdminBlogsPagination: true,
          NuxtLink: true,
          Plus: true,
        },
        mocks: {
          ROUTES: { admin: { stories: { create: "/create" } } },
        },
      },
    });

    await flushPromises();
    expect(mockBlogApi.getAll).toHaveBeenCalled();
  });

  it("shows empty state when no blogs are found", async () => {
    mockBlogApi.getAll.mockResolvedValue({
      data: {
        objects: [],
        totalItems: 0,
      },
    });

    const wrapper = mount(ListView, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: true,
          AdminBlogsStoriesSkeleton: false,
          BlogsStoryListItem: true,
          AdminBlogsPagination: true,
          NuxtLink: true,
          Plus: true,
        },
        mocks: {
          ROUTES: { admin: { stories: { create: "/create" } } },
        },
      },
    });

    await flushPromises();
    expect(wrapper.text()).toContain("No stories found");
  });

  it("renders a list of blogs", async () => {
    const blogs = [
      { id: 1, titel: "Blog 1" },
      { id: 2, titel: "Blog 2" },
    ];
    mockBlogApi.getAll.mockResolvedValue({
      data: {
        objects: blogs,
        totalItems: 2,
      },
    });

    const wrapper = mount(ListView, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: true,
          AdminBlogsStoriesSkeleton: true,
          BlogsStoryListItem: {
            name: "BlogsStoryListItem",
            template: '<div class="blog-item">{{ story.titel }}</div>',
            props: ["story"],
          },
          AdminBlogsPagination: true,
          NuxtLink: true,
          Plus: true,
        },
        mocks: {
          ROUTES: { admin: { stories: { create: "/create" } } },
        },
      },
    });

    await flushPromises();
    expect(wrapper.findAll(".blog-item").length).toBe(2);
    expect(wrapper.text()).toContain("2 results");
  });

  it("calls handleDelete when delete event is emitted", async () => {
    const blog = { id: 1, titel: "Blog 1" };
    mockBlogApi.getAll.mockResolvedValue({
      data: {
        objects: [blog],
        totalItems: 1,
      },
    });
    mockBlogApi.remove.mockResolvedValue({ data: {} });
    window.confirm = vi.fn().mockReturnValue(true);

    const wrapper = mount(ListView, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: true,
          AdminBlogsStoriesSkeleton: true,
          BlogsStoryListItem: {
            name: "BlogsStoryListItem",
            template:
              '<div class="blog-item"><button @click="$emit(\'delete\')">Delete</button></div>',
            props: ["story"],
          },
          AdminBlogsPagination: true,
          NuxtLink: true,
          Plus: true,
        },
        mocks: {
          ROUTES: { admin: { stories: { create: "/create" } } },
        },
      },
    });

    await flushPromises();
    await wrapper.find("button").trigger("click");

    expect(window.confirm).toHaveBeenCalled();
    expect(mockBlogApi.remove).toHaveBeenCalledWith(blog.id);
    await flushPromises();
    expect(mockSnackbarAdd).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });
});

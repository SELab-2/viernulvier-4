import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import TagFilter from "../../../app/components/archive/TagFilter.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import * as useTagApiModule from "../../../app/composables/useTagApi";

vi.mock("../../../app/composables/useTagApi", () => ({
  useTagApi: vi.fn(),
}));

const mockArchiveView = {
  tagIds: ref([]),
};

mockNuxtImport("useArchiveView", () => () => mockArchiveView);

const mockLocale = ref("en");
mockNuxtImport("useI18n", () => () => ({
  t: (key: string, _params?: Record<string, unknown>) => key,
  locale: mockLocale,
}));

describe("TagFilter", () => {
  const mockTagApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTagApi.getAll.mockReset(); // Ensure Once queue is cleared
    (useTagApiModule.useTagApi as Mock).mockReturnValue(mockTagApi);
    mockArchiveView.tagIds.value = [];
    mockLocale.value = "en";
  });

  it("fetches tags on mount and filters out N/A", async () => {
    mockTagApi.getAll.mockResolvedValue({
      data: {
        objects: [
          { id: 1, tag: "Tag 1" },
          { id: 2, tag: "N/A" },
          { id: 3, tag: "Tag 3" },
        ],
        totalItems: 3,
      },
    });

    const wrapper = mount(TagFilter);
    await flushPromises();

    expect(mockTagApi.getAll).toHaveBeenCalled();
    const buttons = wrapper.findAll("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text()).toBe("Tag 1");
    expect(buttons[1].text()).toBe("Tag 3");
  });

  it("handles paginated tag fetching", async () => {
    // First page
    mockTagApi.getAll.mockResolvedValueOnce({
      data: {
        objects: [{ id: 1, tag: "Tag 1" }],
        totalItems: 150, // More than limit (100)
      },
    });
    // Second page
    mockTagApi.getAll.mockResolvedValueOnce({
      data: {
        objects: [{ id: 2, tag: "Tag 2" }],
        totalItems: 150,
      },
    });

    mount(TagFilter);
    await flushPromises();

    expect(mockTagApi.getAll).toHaveBeenCalledTimes(2);
  });

  it("toggles tags on click", async () => {
    mockTagApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, tag: "Tag 1" }],
        totalItems: 1,
      },
    });

    const wrapper = mount(TagFilter);
    await flushPromises();

    const tagBtn = wrapper.find("button");
    await tagBtn.trigger("click");
    expect(mockArchiveView.tagIds.value).toEqual([1]);

    await tagBtn.trigger("click");
    expect(mockArchiveView.tagIds.value).toEqual([]);
  });

  it("shows more / less buttons when many tags are present", async () => {
    const manyTags = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      tag: `Tag ${i}`,
    }));
    mockTagApi.getAll.mockResolvedValue({
      data: {
        objects: manyTags,
        totalItems: 30,
      },
    });

    const wrapper = mount(TagFilter);
    await flushPromises();

    // Max visible is 24
    expect(wrapper.findAll("button")).toHaveLength(25); // 24 tags + 1 "show more"
    expect(wrapper.text()).toContain("archive.show_more");

    await wrapper.find("button:last-child").trigger("click");
    expect(wrapper.findAll("button")).toHaveLength(31); // 30 tags + 1 "show less"
    expect(wrapper.text()).toContain("archive.show_less");
  });

  it("clears all selection", async () => {
    mockTagApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, tag: "Tag 1" }],
        totalItems: 1,
      },
    });

    mockArchiveView.tagIds.value = [1];
    const wrapper = mount(TagFilter);
    await flushPromises();

    expect(wrapper.text()).toContain("archive.clear_tags");

    const clearBtn = wrapper.find("button:last-child");
    await clearBtn.trigger("click");
    expect(mockArchiveView.tagIds.value).toEqual([]);
  });

  it("refetches tags on locale change", async () => {
    mockTagApi.getAll.mockResolvedValue({
      data: { objects: [], totalItems: 0 },
    });

    mount(TagFilter);
    await flushPromises();
    mockTagApi.getAll.mockClear();

    mockLocale.value = "nl";
    await nextTick();
    expect(mockTagApi.getAll).toHaveBeenCalled();
  });
});

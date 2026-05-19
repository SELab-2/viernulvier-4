import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import TagSelector from "../../../../app/components/admin/productions/TagSelector.vue";
import * as useTagApiModule from "../../../../app/composables/useTagApi";

vi.mock("../../../../app/composables/useTagApi", () => ({
  useTagApi: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        tags: {
          available: "Available Tags",
          createNew: "Create New",
          newPlaceholderNL: "NL Name",
          newPlaceholderEN: "EN Name",
          newTags: "New Tags",
          selected: "selected",
          clearTags: "Clear all",
        },
      },
    },
  },
});

describe("AdminProductionsTagSelector", () => {
  const mockTagApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTagApiModule.useTagApi as Mock).mockReturnValue(mockTagApi);
    mockTagApi.getAll.mockResolvedValue({
      data: {
        objects: [
          { id: 1, tag: "Tag 1" },
          { id: 2, tag: "Tag 2" },
        ],
        totalItems: 2,
      },
    });
  });

  it("renders correctly and fetches tags on mount", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: {
          Plus: true,
          X: true,
        },
      },
      props: {
        selected: [],
      },
    });

    expect(wrapper.find(".animate-pulse").exists()).toBe(true);
    await flushPromises();
    expect(mockTagApi.getAll).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Tag 1");
    expect(wrapper.text()).toContain("Tag 2");
  });

  it("emits change when an existing tag is clicked", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: { Plus: true, X: true },
      },
      props: {
        selected: [],
      },
    });

    await flushPromises();
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click"); // Click Tag 1

    expect(wrapper.emitted("change")?.[0][0]).toEqual([
      { type: "existing", id: 1, label: "Tag 1" },
    ]);
  });

  it("emits change when a selected tag is clicked again (unselect)", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: { Plus: true, X: true },
      },
      props: {
        selected: [{ type: "existing", id: 1, label: "Tag 1" }],
      },
    });

    await flushPromises();
    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click"); // Click Tag 1 again

    expect(wrapper.emitted("change")?.[0][0]).toEqual([]);
  });

  it("opens new tag input and emits change when a new tag is confirmed", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: { Plus: true, X: true },
      },
      props: {
        selected: [],
      },
    });

    await flushPromises();

    // Open input
    const createBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Create New"));
    await createBtn?.trigger("click");

    const inputNL = wrapper.find('input[placeholder="NL Name"]');
    expect(inputNL.exists()).toBe(true);

    await inputNL.setValue("New Custom Tag NL");
    await inputNL.trigger("keydown.enter");

    const inputEN = wrapper.find('input[placeholder="EN Name"]');
    expect(inputEN.exists()).toBe(true);

    await inputEN.setValue("New Custom Tag EN");
    await inputEN.trigger("keydown.enter");

    expect(wrapper.emitted("change")?.[0][0]).toEqual([
      {
        type: "new",
        label: { nl: "New Custom Tag NL", en: "New Custom Tag EN" },
      },
    ]);
  });

  it("does not emit change if new tag label already exists", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: { Plus: true, X: true },
      },
      props: {
        selected: [],
      },
    });

    await flushPromises();

    await wrapper
      .findAll("button")
      .find((b) => b.text().includes("Create New"))
      ?.trigger("click");
    const input = wrapper.find("input");

    await input.setValue("Tag 1"); // Tag 1 already exists in availableTags
    await input.trigger("keydown.enter");

    expect(wrapper.emitted("change")).toBeFalsy();
  });

  it("emits empty array when Clear all is clicked", async () => {
    const wrapper = mount(TagSelector, {
      global: {
        plugins: [i18n],
        stubs: { Plus: true, X: true },
      },
      props: {
        selected: [{ type: "existing", id: 1, label: "Tag 1" }],
      },
    });

    await flushPromises();
    const clearBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Clear all"));
    await clearBtn?.trigger("click");

    expect(wrapper.emitted("change")?.[0][0]).toEqual([]);
  });
});

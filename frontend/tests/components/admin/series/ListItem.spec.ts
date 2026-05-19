import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import ListItem from "../../../../app/components/admin/series/ListItem.vue";
import * as useSeriesApiModule from "../../../../app/composables/useSeriesApi";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

vi.mock("../../../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

const mockLocale = ref("en");
mockNuxtImport("useI18n", () => () => ({
  t: (key: string, _params?: Record<string, unknown>) => key,
  locale: mockLocale,
}));

describe("AdminSeriesListItem", () => {
  const mockApi = {
    getSeriesProductions: vi.fn(),
  };

  const defaultProps = {
    series: {
      id: 1,
      titel: { en: "Series 1", nl: "Reeks 1" },
      description: { en: "Desc 1", nl: "Beschrijving 1" },
    },
    isExpanded: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(mockApi);
    mockApi.getSeriesProductions.mockResolvedValue({
      data: { totalItems: 5 },
    });
  });

  it("renders summary info and loads production count", async () => {
    const wrapper = mount(ListItem, {
      props: defaultProps,
      global: {
        stubs: {
          ChevronDown: true,
          ChevronUp: true,
          Trash2: true,
          Layers: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("Series 1");
    expect(wrapper.text()).toContain("ID: 1");
    expect(wrapper.text()).toContain("5");
    expect(mockApi.getSeriesProductions).toHaveBeenCalledWith(
      1,
      "en",
      expect.any(Object),
    );
  });

  it("emits toggle on header click", async () => {
    const wrapper = mount(ListItem, {
      props: defaultProps,
      global: {
        stubs: {
          ChevronDown: true,
          ChevronUp: true,
          Trash2: true,
          Layers: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    await wrapper.find(".flex.cursor-pointer").trigger("click");
    expect(wrapper.emitted("toggle")).toBeTruthy();
  });

  it("shows expanded content when isExpanded is true", () => {
    const wrapper = mount(ListItem, {
      props: { ...defaultProps, isExpanded: true },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          AdminSharedProductionLinker: true,
          ChevronDown: true,
          ChevronUp: true,
          Trash2: true,
          Layers: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    expect(
      wrapper
        .findComponent({ name: "AdminProductionsSeriesItemEditor" })
        .exists(),
    ).toBe(true);
    expect(
      wrapper.findComponent({ name: "AdminSharedProductionLinker" }).exists(),
    ).toBe(true);
  });

  it("emits save when save button is clicked", async () => {
    const wrapper = mount(ListItem, {
      props: { ...defaultProps, isExpanded: true },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          AdminSharedProductionLinker: true,
          ChevronDown: true,
          ChevronUp: true,
          Trash2: true,
          Layers: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    const saveBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("general.save"));
    await saveBtn?.trigger("click");

    expect(wrapper.emitted("save")).toBeTruthy();
    expect(wrapper.emitted("save")?.[0][0]).toEqual({
      id: 1,
      titel: { en: "Series 1", nl: "Reeks 1" },
      description: { en: "Desc 1", nl: "Beschrijving 1" },
    });
  });

  it("emits delete when delete button is clicked", async () => {
    const wrapper = mount(ListItem, {
      props: { ...defaultProps, isExpanded: true },
      global: {
        stubs: {
          AdminProductionsSeriesItemEditor: true,
          AdminSharedProductionLinker: true,
          ChevronDown: true,
          ChevronUp: true,
          Trash2: true,
          Layers: true,
          Save: true,
          Loader2: true,
        },
      },
    });

    const deleteBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("general.delete"));
    await deleteBtn?.trigger("click");

    expect(wrapper.emitted("delete")).toBeTruthy();
  });
});

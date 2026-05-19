import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { ProductionSeriesForm } from "~/composables/productions/steps/productionSeries";
import SeriesForm from "../../../../app/components/admin/productions/SeriesForm.vue";
import * as useSeriesApiModule from "../../../../app/composables/useSeriesApi";

vi.mock("../../../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        steps: { series: "Series" },
        series: {
          hint: "Hint",
          add: "Add series",
          "search-placeholder": "Search...",
          "no-results": "No results",
          link: "Link",
          new: "New",
          linked: "Linked",
          unlink: "Unlink",
          delete: "Delete",
          none: "None",
        },
      },
      common: { loading: "Loading..." },
    },
  },
});

describe("AdminProductionsSeriesForm", () => {
  const mockSeriesApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(mockSeriesApi);
    vi.useFakeTimers();
  });

  it("renders empty state correctly", () => {
    const wrapper = mount(SeriesForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Plus: true,
          Trash2: true,
          ChevronDown: true,
          ChevronUp: true,
          Search: true,
          Link: true,
          Loader2: true,
          X: true,
          SeriesItemEditor: true,
        },
      },
      props: { modelValue: [] as ProductionSeriesForm },
    });

    expect(wrapper.text()).toContain("None");
  });

  it("emits update:modelValue when adding a new series", async () => {
    const wrapper = mount(SeriesForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Plus: true,
          Trash2: true,
          ChevronDown: true,
          ChevronUp: true,
          Search: true,
          Link: true,
          Loader2: true,
          X: true,
          SeriesItemEditor: true,
        },
      },
      props: { modelValue: [] as ProductionSeriesForm },
    });

    const addBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Add series"));
    await addBtn?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionSeriesForm;
    expect(emitted).toHaveLength(1);
    expect(emitted[0].type).toBe("new");
  });

  it("searches and links an existing series", async () => {
    const wrapper = mount(SeriesForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Plus: true,
          Trash2: true,
          ChevronDown: true,
          ChevronUp: true,
          Search: true,
          Link: true,
          Loader2: true,
          X: true,
          SeriesItemEditor: true,
        },
      },
      props: { modelValue: [] as ProductionSeriesForm },
    });

    mockSeriesApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: "Series 1", description: "Desc 1" }],
      },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue("Series");

    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(mockSeriesApi.getAll).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Series 1");

    const linkBtn = wrapper.find("li");
    await linkBtn.trigger("mousedown");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionSeriesForm;
    expect(emitted[0]).toMatchObject({
      type: "existing",
      id: 1,
      titel: { nl: "Series 1" },
    });
  });

  it("handles deleting an item", async () => {
    const modelValue: ProductionSeriesForm = [
      {
        type: "new" as const,
        titel: { nl: "New Series" },
        description: { nl: "" },
      },
    ];

    const wrapper = mount(SeriesForm, {
      global: {
        plugins: [i18n],
        stubs: {
          Plus: true,
          Trash2: true,
          ChevronDown: true,
          ChevronUp: true,
          Search: true,
          Link: true,
          Loader2: true,
          X: true,
          SeriesItemEditor: true,
        },
      },
      props: { modelValue },
    });

    const deleteBtn = wrapper.find('button[title="Delete"]');
    await deleteBtn.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0][0]).toHaveLength(0);
  });
});

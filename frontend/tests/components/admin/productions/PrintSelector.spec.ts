import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import PrintSelector from "../../../../app/components/admin/productions/PrintSelector.vue";
import * as usePrintApiModule from "../../../../app/composables/media/usePrintApi";

vi.mock("../../../../app/composables/media/usePrintApi", () => ({
  usePrintApi: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        media: {
          searchPrints: "Search prints...",
          searching: "Searching...",
          noPrintsFound: "No prints found",
        },
        series: { link: "Link" },
      },
      prints: { types: { flyer: "Flyer" } },
    },
  },
});

describe("AdminProductionsPrintSelector", () => {
  const mockPrintApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (usePrintApiModule.usePrintApi as Mock).mockReturnValue(mockPrintApi);
    vi.useFakeTimers();
  });

  const stubs = {
    Search: true,
    X: true,
    Loader2: true,
    Link: true,
    MediaDisplay: true,
    Trash2: true,
  };

  it("renders empty state correctly", () => {
    const wrapper = mount(PrintSelector, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue: [] },
    });

    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
    expect(wrapper.find(".grid").exists()).toBe(false);
  });

  it("searches and selects a print", async () => {
    mockPrintApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: "Print 1", print_type: "flyer" }],
      },
    });

    const wrapper = mount(PrintSelector, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue: [] },
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue("Print");

    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(mockPrintApi.getAll).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Print 1");

    const li = wrapper.find("li");
    await li.trigger("mousedown");

    expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual([
      { id: 1, titel: "Print 1", print_type: "flyer" },
    ]);
  });

  it("removes a linked print", async () => {
    const modelValue = [
      { id: 1, titel: "Linked Print", print_type: "flyer" } as any,
    ];

    const wrapper = mount(PrintSelector, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    expect(wrapper.text()).toContain("Linked Print");

    const removeBtn = wrapper.find("button.bg-action-red-icon");
    await removeBtn.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0][0]).toEqual([]);
  });

  it("closes dropdown when clicking outside", async () => {
    mockPrintApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, titel: "Print 1", print_type: "flyer" }],
      },
    });

    const wrapper = mount(PrintSelector, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue: [] },
      attachTo: document.body,
    });

    const input = wrapper.find('input[type="text"]');
    await input.setValue("test");

    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(wrapper.find("ul").exists()).toBe(true);

    // Click outside
    document.dispatchEvent(new MouseEvent("mousedown"));
    await (wrapper.vm as any as { $nextTick: () => Promise<void> }).$nextTick();

    expect(wrapper.find("ul").exists()).toBe(false);
    wrapper.unmount();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import LocaleSelector from "../../app/components/LocaleSelector.vue";

const mockSetLocale = vi.fn();
const mockLocale = ref("en");
const mockLocales = ref([
  { code: "en", name: "English" },
  { code: "nl", name: "Nederlands" },
]);

// Mock vue-i18n
vi.mock("vue-i18n", async (importOriginal) => {
  const actual = await (
    importOriginal as () => Promise<Record<string, unknown>>
  )();
  return {
    ...actual,
    useI18n: () => ({
      locale: mockLocale,
      locales: mockLocales,
      setLocale: mockSetLocale,
      t: (key: string) => key,
    }),
  };
});

describe("LocaleSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale.value = "en";
  });

  const mountSelector = (options = {}) => {
    return mount(LocaleSelector, {
      global: {
        stubs: {
          ChevronDown: true,
          Check: true,
          Transition: false,
        },
      },
      ...options,
    });
  };

  it("renders the current locale", () => {
    const wrapper = mountSelector();
    expect(wrapper.text()).toContain("EN");
    expect(wrapper.findAll("button").length).toBe(1);
  });

  it("toggles dropdown when toggle button is clicked", async () => {
    const wrapper = mountSelector();
    const toggle = wrapper.find("button");

    await toggle.trigger("click");
    expect(wrapper.findAll("button").length).toBe(3);
    expect(wrapper.text()).toContain("NL");

    await toggle.trigger("click");
    await vi.waitFor(() => {
      if (wrapper.findAll("button").length !== 1) throw new Error("Still open");
    });
    expect(wrapper.findAll("button").length).toBe(1);
  });

  it("calls setLocale and closes when a locale is clicked", async () => {
    const wrapper = mountSelector();
    await wrapper.find("button").trigger("click");

    const buttons = wrapper.findAll("button");
    const nlButton = buttons.find((b) => b.text().includes("NL"));
    await nlButton?.trigger("click");

    expect(mockSetLocale).toHaveBeenCalledWith("nl");
    await vi.waitFor(() => {
      if (wrapper.findAll("button").length !== 1) throw new Error("Still open");
    });
    expect(wrapper.findAll("button").length).toBe(1);
  });

  it("closes on escape key", async () => {
    const wrapper = mountSelector({ attachTo: document.body });
    await wrapper.find("button").trigger("click");
    expect(wrapper.findAll("button").length).toBe(3);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await vi.waitFor(() => {
      if (wrapper.findAll("button").length !== 1) throw new Error("Still open");
    });

    expect(wrapper.findAll("button").length).toBe(1);
    wrapper.unmount();
  });
});

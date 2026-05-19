import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import Preview from "../../../../app/components/admin/blogs/Preview.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          preview: {
            lang: "Language",
            placeholderTitle: "Untitled Story",
            bodyPlaceholder: "Content will appear here...",
            badge: "Live Preview",
          },
        },
      },
      stories: {
        minRead: "min read",
      },
    },
  },
});

// Mock ResizeObserver
global.ResizeObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

describe("AdminBlogsPreview", () => {
  const defaultProps = {
    data: {
      titel: { nl: "NL Titel", en: "EN Title" },
      description: { nl: "<p>NL Content</p>", en: "<p>EN Content</p>" },
      id: 1,
    },
    headerCrop: null,
  };

  it("renders correctly with provided data", () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
          Smartphone: true,
          Monitor: true,
          RefreshCcw: true,
        },
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("NL Titel");
    expect(wrapper.text()).toContain("NL Content");
  });

  it("switches language when language buttons are clicked", async () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
          Smartphone: true,
          Monitor: true,
          RefreshCcw: true,
        },
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    const enButton = buttons.find((b) => b.text() === "en");
    await enButton?.trigger("click");

    expect(wrapper.text()).toContain("EN Title");
    expect(wrapper.text()).toContain("EN Content");
  });

  it("switches preview mode when mode buttons are clicked", async () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
          Smartphone: true,
          Monitor: true,
          RefreshCcw: true,
        },
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    // Find button with Monitor icon (or title "Desktop")
    const desktopButton = buttons.find(
      (b) => b.attributes("title") === "Desktop",
    );
    await desktopButton?.trigger("click");

    expect(wrapper.find(".max-w-[375px]").exists()).toBe(false);
  });

  it("shows placeholder when title or body is empty", () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
          Smartphone: true,
          Monitor: true,
          RefreshCcw: true,
        },
      },
      props: {
        data: {
          titel: { nl: "", en: "" },
          description: { nl: "", en: "" },
        },
        headerCrop: null,
      },
    });

    expect(wrapper.text()).toContain("Untitled Story");
    expect(wrapper.text()).toContain("Content will appear here...");
  });
});

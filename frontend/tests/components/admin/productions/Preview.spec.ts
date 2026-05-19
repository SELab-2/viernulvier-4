import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { ProductionCoreForm } from "~/composables/productions/steps/productionCore";
import Preview from "../../../../app/components/admin/productions/Preview.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        preview: {
          title: "Untitled",
          bodyPlaceholder: "No content",
          preview: "Preview",
          hint: "No tags",
        },
      },
      production: {
        events: "Events",
        noEvents: "No events",
        credits: "Credits",
      },
      general: {
        back: "Back",
        readMore: "Read more",
        readLess: "Read less",
      },
    },
  },
});

global.URL.createObjectURL = vi.fn(() => "blob:test");

describe("AdminProductionsPreview", () => {
  const defaultProps = {
    core: {
      nl: {
        titel: "NL Title",
        description1: "NL Desc 1",
        description2: "",
        artist: "Artist",
        tagline: "Tag",
        credits: "Cred",
      },
      en: {
        titel: "EN Title",
        description1: "EN Desc 1",
        description2: "",
        artist: "Artist",
        tagline: "Tag",
        credits: "Cred",
      },
    } as ProductionCoreForm,
    tags: [],
    events: [],
    series: [],
  };

  const stubs = {
    Smartphone: true,
    Monitor: true,
    ArrowUp: true,
    ChevronLeft: true,
    MediaDisplay: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("NL Title");
    expect(wrapper.text()).toContain("NL Desc 1");
    expect(wrapper.text()).toContain("Artist");
  });

  it("switches language when language buttons are clicked", async () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    const enButton = buttons.find((b) => b.text() === "en");
    await enButton?.trigger("click");

    expect(wrapper.text()).toContain("EN Title");
    expect(wrapper.text()).toContain("EN Desc 1");
  });

  it("renders tags, events, and series correctly", () => {
    const props = {
      ...defaultProps,
      tags: [{ type: "existing" as const, id: 1, label: "Test Tag" }],
      events: [
        {
          kind: "new" as const,
          starttime: "2023-12-01T20:00:00Z",
          prices: [],
          location: { label: "Hall 1", id: 10, type: "existing" as const },
        },
      ],
      series: [
        {
          type: "new" as const,
          titel: { nl: "Series 1" },
          description: { nl: "" },
        },
      ],
    };

    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props,
    });

    expect(wrapper.text()).toContain("Test Tag");
    expect(wrapper.text()).toContain("Hall 1");
    expect(wrapper.text()).toContain("Series 1");
  });

  it("switches preview mode when mode buttons are clicked", async () => {
    const wrapper = mount(Preview, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    const desktopButton = buttons.find(
      (b) => b.attributes("title") === "Desktop",
    );
    await desktopButton?.trigger("click");

    expect(wrapper.find(".max-w-[375px]").exists()).toBe(false);
  });
});

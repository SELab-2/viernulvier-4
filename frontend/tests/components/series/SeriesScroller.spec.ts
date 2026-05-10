import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

import type { SeriesView, ProductionView } from "@repo/common";
import SeriesScroller from "../../../app/components/series/SeriesScroller.vue";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      nav: { productions: "producties" },
      series: { noProductions: "Deze reeks bevat geen producties." },
    },
    en: {
      nav: { productions: "productions" },
      series: { noProductions: "This series doesn't contain any productions." },
    },
  },
});

const mockSeries: SeriesView = {
  id: 1,
  titel: "Festival Series 2025",
  description: "A test series description",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockProductions: ProductionView[] = [
  {
    id: 1,
    titel: "Opening Night",
    description1: "",
    description2: null,
    artist: null,
    tagline: null,
    credits: null,
    performer_type: null,
    attendance_mode: null,
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    titel: "Closing Ceremony",
    description1: "",
    description2: null,
    artist: null,
    tagline: null,
    credits: null,
    performer_type: null,
    attendance_mode: null,
    created_at: null,
    updated_at: null,
  },
];

describe("SeriesScroller", () => {
  let wrapper: VueWrapper<InstanceType<typeof SeriesScroller>>;

  beforeEach(() => {
    wrapper = mount(SeriesScroller, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: { template: "<a><slot /></a>" },
          MediaDisplay: { template: "<div />" },
        },
      },
      props: { series: mockSeries, productions: mockProductions },
    });
  });

  it("renders the series title", () => {
    expect(wrapper.text()).toContain("Festival Series 2025");
  });

  it("renders the series description", () => {
    expect(wrapper.text()).toContain("A test series description");
  });

  it("renders the production count", () => {
    expect(wrapper.text()).toContain("2");
  });

  it("shows empty state when no productions", async () => {
    await wrapper.setProps({ productions: [] });
    expect(wrapper.text()).toContain("Deze reeks bevat geen producties.");
  });

  it("does not show empty state when productions exist", () => {
    expect(wrapper.text()).not.toContain("Deze reeks bevat geen producties.");
  });

  it("does not render description when empty string", async () => {
    await wrapper.setProps({ series: { ...mockSeries, description: "" } });
    expect(wrapper.text()).not.toContain("A test series description");
  });

  it("renders an item for each production", () => {
    const titles = mockProductions.map((p) => p.titel);
    expect(titles.length).toBe(2);
  });

  it("renders each production title", () => {
    expect(wrapper.text()).toContain("Opening Night");
    expect(wrapper.text()).toContain("Closing Ceremony");
  });
});

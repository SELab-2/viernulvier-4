import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";

import type { SeriesView } from "@repo/common";
import SeriesFolder from "../../../app/components/series/SeriesFolder.vue";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: { nav: { productions: "producties" } },
    en: { nav: { productions: "productions" } },
  },
});

const mockSeries: SeriesView = {
  id: 1,
  titel: "Festival Series 2025",
  description: "A test series description",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("SeriesFolder", () => {
  let wrapper: VueWrapper<InstanceType<typeof SeriesFolder>>;

  beforeEach(() => {
    wrapper = mount(SeriesFolder, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: { template: "<a :href='to'><slot /></a>", props: ["to"] },
        },
      },
      props: { series: mockSeries, productionCount: 5 },
    });
  });

  it("renders the series title", () => {
    expect(wrapper.text()).toContain("Festival Series 2025");
  });

  it("renders the production count", () => {
    expect(wrapper.text()).toContain("5");
  });

  it("renders the production count label", () => {
    expect(wrapper.text()).toContain("producties");
  });

  it("links to the correct series detail page", () => {
    const link = wrapper.find("a");
    expect(link.attributes("href")).toContain("/series/1");
  });

  it("updates production count when prop changes", async () => {
    await wrapper.setProps({ productionCount: 12 });
    expect(wrapper.text()).toContain("12");
  });
});

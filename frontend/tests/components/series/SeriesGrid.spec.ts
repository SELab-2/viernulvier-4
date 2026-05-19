import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SeriesGrid from "../../../app/components/series/SeriesGrid.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

describe("SeriesGrid", () => {
  const mockItems: any[] = [
    [{ id: 1, name: "Series 1" }, 5],
    [{ id: 2, name: "Series 2" }, 3],
  ];

  it("renders a list of series folders", () => {
    const wrapper = mount(SeriesGrid, {
      props: {
        items: mockItems,
        totalPages: 1,
      },
      global: {
        stubs: {
          SeriesFolder: {
            template: '<div class="series-folder"></div>',
            props: ["series", "productionCount"],
          },
        },
      },
    });

    expect(wrapper.findAll(".series-folder")).toHaveLength(2);
  });

  it("shows empty state when no items", () => {
    const wrapper = mount(SeriesGrid, {
      props: {
        items: [],
        totalPages: 0,
      },
    });

    expect(wrapper.text()).toContain("series.noSeries");
  });

  it("uses grid-rows-5 when multiple pages", () => {
    const wrapper = mount(SeriesGrid, {
      props: {
        items: mockItems,
        totalPages: 2,
      },
      global: {
        stubs: {
          SeriesFolder: true,
        },
      },
    });

    expect(wrapper.find(".grid").classes()).toContain("grid-rows-5");
  });

  it("does not use grid-rows-5 when single page", () => {
    const wrapper = mount(SeriesGrid, {
      props: {
        items: mockItems,
        totalPages: 1,
      },
      global: {
        stubs: {
          SeriesFolder: true,
        },
      },
    });

    expect(wrapper.find(".grid").classes()).not.toContain("grid-rows-5");
  });
});

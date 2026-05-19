import { mount } from "@vue/test-utils";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import SeriesDetailSkeleton from "../../../app/components/series/SeriesDetailSkeleton.vue";
import SeriesPageJumper from "../../../app/components/series/SeriesPageJumper.vue";
import SeriesPagination from "../../../app/components/series/SeriesPagination.vue";
import SeriesProductionsPageJumper from "../../../app/components/series/SeriesProductionsPageJumper.vue";
import SeriesProductionsPagination from "../../../app/components/series/SeriesProductionsPagination.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: { total?: number }) =>
      params?.total ? `${key}:${params.total}` : key,
  }),
}));

mockNuxtImport("useI18n", () => () => ({
  t: (key: string, params?: { total?: number }) =>
    params?.total ? `${key}:${params.total}` : key,
}));

const seriesProductionsView = {
  currentPage: ref(1),
  totalPages: ref(4),
  loading: ref(false),
};

vi.mock("../../../app/composables/useSeriesProductionsView", () => ({
  useSeriesProductionsView: () => seriesProductionsView,
}));

describe("series pagination controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("scrollTo", vi.fn());
    seriesProductionsView.currentPage.value = 1;
    seriesProductionsView.totalPages.value = 4;
    seriesProductionsView.loading.value = false;
  });

  it("renders the detail skeleton as a busy loading state", () => {
    const wrapper = mount(SeriesDetailSkeleton);

    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.attributes("aria-label")).toBe("Loading series");
    expect(wrapper.findAll(".animate-pulse").length).toBeGreaterThan(10);
  });

  it("emits zero-based page jumps for the series page jumper", async () => {
    const wrapper = mount(SeriesPageJumper, {
      props: { currentPage: 0, totalPages: 5, loading: false },
    });

    await wrapper.find("input").setValue("3");
    await wrapper.find("input").trigger("keydown.enter");

    expect(wrapper.emitted("go-to-page")?.[0]).toEqual([2]);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
    expect(wrapper.find("input").element.value).toBe("");
  });

  it("does not emit invalid or loading page jumps", async () => {
    const wrapper = mount(SeriesPageJumper, {
      props: { currentPage: 0, totalPages: 2, loading: true },
    });

    await wrapper.find("input").setValue("2");
    await wrapper.find("input").trigger("blur");

    expect(wrapper.emitted("go-to-page")).toBeUndefined();
  });

  it("emits navigation from the series pagination buttons", async () => {
    const wrapper = mount(SeriesPagination, {
      props: { currentPage: 2, totalPages: 5, loading: false },
    });
    const buttons = wrapper.findAll("button");

    await buttons[0].trigger("click");
    await buttons[1].trigger("click");
    await buttons[2].trigger("click");
    await buttons[3].trigger("click");

    expect(wrapper.emitted("go-to-page")).toEqual([[0], [1], [3], [4]]);
    expect(window.scrollTo).toHaveBeenCalledTimes(4);
  });

  it("updates shared state from production pagination buttons", async () => {
    const wrapper = mount(SeriesProductionsPagination);
    const buttons = wrapper.findAll("button");

    await buttons[2].trigger("click");
    expect(seriesProductionsView.currentPage.value).toBe(2);

    await buttons[3].trigger("click");
    expect(seriesProductionsView.currentPage.value).toBe(4);
  });

  it("updates shared state from the production page jumper", async () => {
    const wrapper = mount(SeriesProductionsPageJumper);

    await wrapper.find("input").setValue("3");
    await wrapper.find("input").trigger("keydown.enter");

    expect(seriesProductionsView.currentPage.value).toBe(3);
    expect(wrapper.find("input").element.value).toBe("");
  });
});

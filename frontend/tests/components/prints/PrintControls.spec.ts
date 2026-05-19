import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { PrintTypeValues } from "@repo/common";
import PrintsPagination from "../../../app/components/prints/PrintsPagination.vue";
import PrintsToolbar from "../../../app/components/prints/PrintsToolbar.vue";

const searchQuery = ref("");
const fetchSuggestions = vi.fn();

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("~/composables/media/usePrintView", () => ({
  usePrintView: () => ({ searchQuery, fetchSuggestions }),
}));

describe("print controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("scrollTo", vi.fn());
    searchQuery.value = "";
  });

  it("emits page navigation from pagination controls", async () => {
    const wrapper = mount(PrintsPagination, {
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

  it("hides pagination for a single page and blocks loading navigation", async () => {
    const single = mount(PrintsPagination, {
      props: { currentPage: 0, totalPages: 1, loading: false },
    });
    expect(single.find("nav").exists()).toBe(false);

    const loading = mount(PrintsPagination, {
      props: { currentPage: 1, totalPages: 3, loading: true },
    });
    await loading.findAll("button")[2].trigger("click");
    expect(loading.emitted("go-to-page")).toBeUndefined();
  });

  it("emits search changes and selected print type filters", async () => {
    const wrapper = mount(PrintsToolbar, {
      global: {
        stubs: {
          SearchBar: {
            props: [
              "modelValue",
              "fetchSuggestions",
              "limit",
              "scrollLimit",
              "placeholder",
            ],
            template:
              '<div data-test="searchbar">{{ placeholder }} {{ limit }} {{ scrollLimit }}</div>',
          },
        },
      },
    });

    expect(wrapper.find('[data-test="searchbar"]').text()).toContain(
      "searchbar.placeholder 15 5",
    );

    searchQuery.value = "poster";
    await nextTick();
    expect(wrapper.emitted("update:search")?.[0]).toEqual(["poster"]);

    await wrapper.find("button").trigger("click");
    const filterButtons = wrapper.findAll("button");
    await filterButtons[2].trigger("click");

    expect(wrapper.emitted("update:types")?.[0]).toEqual([PrintTypeValues[0]]);

    await wrapper.find(".absolute.-top-2").trigger("click");
    expect(wrapper.emitted("update:types")?.[1]).toEqual([null]);
  });
});

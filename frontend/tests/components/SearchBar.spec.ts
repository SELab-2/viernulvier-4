import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import SearchBar from "../../app/components/SearchBar.vue";
import type { SearchSuggestion } from "../../app/types/Search";
import { createI18n } from "vue-i18n";

vi.useFakeTimers();

const i18n = createI18n({
  legacy: false,
  locale: "nl",
  messages: {
    nl: { searchbar: { placeholder: "Zoeken..." } },
    en: { searchbar: { placeholder: "Search..." } },
  },
});

const fruits: SearchSuggestion[] = [
  { display: "Apple", context: "Fruit", searchValue: "Apple" },
  { display: "Banana", context: "Fruit", searchValue: "Banana" },
  { display: "Orange", context: "Fruit", searchValue: "Orange" },
  { display: "Grapes", context: "Fruit", searchValue: "Grapes" },
  { display: "Pineapple", context: "Fruit", searchValue: "Pineapple" },
  { display: "Mango", context: "Fruit", searchValue: "Mango" },
];

function mockFetchSuggestions(
  query: string,
  limit: number,
): Promise<SearchSuggestion[]> {
  return Promise.resolve(fruits.slice(0, limit));
}

describe("SearchBar", () => {
  let wrapper: VueWrapper<InstanceType<typeof SearchBar>>;

  beforeEach(() => {
    wrapper = mount(SearchBar, {
      global: {
        plugins: [i18n],
      },
      props: {
        modelValue: "",
        fetchSuggestions: mockFetchSuggestions,
        limit: 6,
        label: "Fruits",
        placeholder: "Type a fruit",
      },
    });
  });

  it("renders the label and placeholder", () => {
    expect(wrapper.find("label").text()).toContain("Fruits");
    expect(wrapper.find("input").attributes("placeholder")).toBe(
      "Type a fruit",
    );
  });

  it("limits the number of results to `limit` prop", async () => {
    await wrapper.setProps({ limit: 2 });
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap");

    vi.advanceTimersByTime(150);
    await flushPromises();

    const suggestions = wrapper.findAll("li");
    expect(suggestions.length).toBe(2);
  });

  it("emits `update:modelValue` when a suggestion is clicked", async () => {
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap");

    vi.advanceTimersByTime(150);
    await flushPromises();

    const firstSuggestion = wrapper.find("li");
    await firstSuggestion.trigger("mousedown");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]);
    expect(wrapper.find("input").element.value).toBe("Apple");
  });

  it("emits `update:modelValue` with typed value when Enter is pressed", async () => {
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap");

    await input.trigger("keydown.enter");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["ap"]);
  });

  it("clear button appears when input has text and clears on click", async () => {
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap");

    const clearButton = wrapper.find("button");
    expect(clearButton.exists()).toBe(true);

    await clearButton.trigger("mousedown");

    expect(wrapper.find("input").element.value).toBe("");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""]);
    expect(wrapper.find("button").exists()).toBe(false);
  });

  it("navigates suggestions with arrow keys", async () => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();

    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap");

    vi.advanceTimersByTime(150);
    await flushPromises();

    await input.trigger("keydown.down"); // Highlight index 0 (Apple)
    expect(wrapper.findAll("li")[0].classes()).toContain("bg-muted");

    await input.trigger("keydown.down"); // Highlight index 1 (Banana)
    expect(wrapper.findAll("li")[1].classes()).toContain("bg-muted");
    expect(wrapper.findAll("li")[0].classes()).not.toContain("bg-muted");

    await input.trigger("keydown.up"); // Back to index 0
    expect(wrapper.findAll("li")[0].classes()).toContain("bg-muted");

    await input.trigger("keydown.enter"); // Select highlighted
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]);
  });

  it("searches internally if fetchSuggestions is not provided", async () => {
    const wrapperNoFetch = mount(SearchBar, {
      global: { plugins: [i18n] },
      props: {
        modelValue: "",
        suggestions: fruits,
        limit: 5,
      },
    });

    const input = wrapperNoFetch.find("input");
    await input.trigger("focus");
    await input.setValue("Apple");

    // No timers needed for sync search
    expect(wrapperNoFetch.text()).toContain("Apple");
    expect(wrapperNoFetch.text()).not.toContain("Banana");
  });

  it("handles fetch errors gracefully", async () => {
    const wrapperFail = mount(SearchBar, {
      global: { plugins: [i18n] },
      props: {
        modelValue: "",
        fetchSuggestions: vi.fn().mockRejectedValue(new Error("Fail")),
        limit: 5,
      },
    });

    const input = wrapperFail.find("input");
    await input.trigger("focus");
    await input.setValue("error");

    vi.advanceTimersByTime(150);
    await flushPromises();

    expect(wrapperFail.findAll("li").length).toBe(0);
  });
});

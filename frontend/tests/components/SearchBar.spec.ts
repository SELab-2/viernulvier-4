import { describe, it, expect, beforeEach, vi } from "vitest";
import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import SearchBar from "../../app/components/SearchBar.vue";
import type { SearchSuggestion } from "../../app/types/Search";
import { createI18n } from "vue-i18n";

vi.useFakeTimers();

const i18n = createI18n({
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

// 2. Make the mock async and add actual filtering logic
// eslint-disable-next-line @typescript-eslint/require-await
async function mockFetchSuggestions(
  query: string,
  limit: number,
): Promise<SearchSuggestion[]> {
  return fruits.slice(0, limit);
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
    // normally matches Apple, Banana, Orange, Grapes, Pineapple, Mango, but only needs to show 2

    // Have to advance the timer because of delay on the results.
    vi.advanceTimersByTime(150);
    await flushPromises();

    const suggestions = wrapper.findAll("li");
    expect(suggestions.length).toBe(2);
  });

  it("emits `update:modelValue` when a suggestion is clicked", async () => {
    const input = wrapper.find("input");
    await input.trigger("focus");
    await input.setValue("ap"); // matches Apple, Grapes, Pineapple

    // Have to advance the timer because of delay on the results.
    vi.advanceTimersByTime(150);
    await flushPromises();

    const firstSuggestion = wrapper.find("li");
    await firstSuggestion.trigger("mousedown");

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]); // grabs the first time the event was emitted
    expect(wrapper.find("input").element.value).toBe("Apple"); // internalQuery contains selected value
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

    // button should be visible now
    const clearButton = wrapper.find("button");
    expect(clearButton.exists()).toBe(true);

    await clearButton.trigger("mousedown"); // clicking on the clear button

    expect(wrapper.find("input").element.value).toBe("");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""]); // from clear
    expect(wrapper.find("button").exists()).toBe(false); // button disappears when empty
  });
});

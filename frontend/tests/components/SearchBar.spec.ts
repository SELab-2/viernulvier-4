import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SearchBar from "../../app/components/SearchBar.vue";
import { createI18n } from "vue-i18n";

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: { searchbar: { placeholder: "Zoeken..." } },
        en: { searchbar: { placeholder: "Search..." } },
    },
});

describe("SearchBar", () => {
    let wrapper: ReturnType<typeof mount>;
    const items = ["Apple", "Banana", "Orange", "Grapes", "Pineapple", "Mango"];

    beforeEach(() => {
        wrapper = mount(SearchBar, {
            global: {
                plugins: [i18n],
            },
            props: {
                modelValue: "",
                items,
                label: "Fruits",
                placeholder: "Type a fruit",
            },
        });
    });

    it("renders the label and placeholder", () => {
        expect(wrapper.find("label").text()).toContain("Fruits");
        expect(wrapper.find("input").attributes("placeholder")).toBe("Type a fruit");
    });

    it("filters results case-insensitively based on input", async () => {
        const input = wrapper.find("input");
        await input.setValue("ap"); // types in the value in the field

        const suggestions = wrapper.findAll("li"); // searches for all list items
        const suggestionTexts = suggestions.map((li) => li.text());

        expect(suggestionTexts).toEqual(expect.arrayContaining(["Apple", "Grapes", "Pineapple"]));
    });

    it("limits the number of results to `limit` prop", async () => {
        await wrapper.setProps({ limit: 2 });
        const input = wrapper.find("input");
        await input.setValue("a"); // normally matches Apple, Banana, Orange, Grapes, Pineapple, Mango

        const suggestions = wrapper.findAll("li");
        expect(suggestions.length).toBe(2);
    });

    it("emits `update:modelValue` when a suggestion is clicked", async () => {
        const input = wrapper.find("input");
        await input.setValue("ap"); // matches Apple, Grapes, Pineapple

        const firstSuggestion = wrapper.find("li");
        await firstSuggestion.trigger("click");

        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Apple"]); // grabs the first time the event was emitted
        expect(wrapper.find("input").element.value).toBe(""); // internalQuery cleared
    });

    it("shows suggestions when input is empty", async () => {
        await wrapper.setProps({ limit: 3 });
        const input = wrapper.find("input");
        await input.trigger("focus");
        await input.setValue("");

        expect(wrapper.findAll("li").length).toBe(3); //there should be max 3 suggestions given
    });
});
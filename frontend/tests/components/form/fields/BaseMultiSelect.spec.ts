import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { X } from "lucide-vue-next";
import BaseMultiSelect from "../../../../app/components/form/fields/BaseMultiSelect.vue";

const i18n = createI18n({ // needed so no error is thrown when mounted
    locale: "nl",
    messages: {
        nl: { searchbar: { placeholder: "Zoeken..." } },
        en: { searchbar: { placeholder: "Search..." } },
    },
});

describe("BaseMultiSelect", () => {
    let wrapper: ReturnType<typeof mount>;
    const options = ["Apple", "Banana", "Mango", "Grape"];

    beforeEach(() => {
        wrapper = mount(BaseMultiSelect, {
            global: { plugins: [i18n] },
            props: { label: "Fruits", required: true, options, multiple: true },
        });
    });

    it("renders the label", () => {
        expect(wrapper.find("label").text()).toContain("Fruits");
    });

    it("shows required star when required", () => {
        expect(wrapper.find("label").text()).toContain("*");
    });

    it("does not show required star when not required", async () => {
        await wrapper.setProps({ required: false });
        expect(wrapper.find("label").text()).not.toContain("*");
    });

    it("does not render label when not provided", () => {
        const w = mount(BaseMultiSelect, {
            global: { plugins: [i18n] },
            props: { options },
        });
        expect(w.find("label").exists()).toBe(false);
    });

    it("does not show selected list when nothing is selected", () => {
        expect(wrapper.find('[data-testid="item-container"]').exists()).toBe(false);
    });

    it("adds an item when selected from suggestions", async () => {
        const input = wrapper.find("input");
        await input.trigger("focus");
        await input.setValue("Apple");
        await wrapper.find("li").trigger("mousedown");
        expect(wrapper.text()).toContain("Apple");
    });

    it("removes selected item from suggestions", async () => {
        const input = wrapper.find("input");
        await input.trigger("focus");
        await input.setValue("Apple");
        await wrapper.find("li").trigger("mousedown");

        // apple should no longer appear as a suggestion
        await input.trigger("focus");
        await input.setValue("Apple");
        expect(wrapper.findAll("li").length).toBe(0);
    });

    it("replaces selection in single mode", async () => {
        const w = mount(BaseMultiSelect, {
            global: { plugins: [i18n] },
            props: { options, multiple: false },
        });
        const input = w.find("input");

        await input.trigger("focus");
        await input.setValue("Apple");
        await w.find("li").trigger("mousedown");

        await input.trigger("focus");
        await input.setValue("Banana");
        await w.find("li").trigger("mousedown");

        const selectedList = w.find('[data-testid="item-container"]');
        expect(selectedList.text()).not.toContain("Apple");
        expect(selectedList.text()).toContain("Banana");
    });

    it("rejects values not in options when freeInput is false", async () => {
        const input = wrapper.find("input");
        await input.trigger("focus");
        await input.setValue("CustomValue");
        await input.trigger("keydown", { key: "Enter" });
        expect(wrapper.text()).not.toContain("CustomValue");
    });

    it("accepts values not in options when freeInput is true", async () => {
        const w = mount(BaseMultiSelect, {
            global: { plugins: [i18n] },
            props: { options, multiple: true, freeInput: true },
        });
        const input = w.find("input");
        await input.trigger("focus");
        await input.setValue("CustomValue");
        await input.trigger("keydown", { key: "Enter" });
        expect(w.text()).toContain("CustomValue");
    });

    it("removes an item when X is clicked", async () => {
        const input = wrapper.find("input");
        await input.trigger("focus");
        await input.setValue("Apple");
        await wrapper.find("li").trigger("mousedown");

        await wrapper.findComponent(X).trigger("click");
        expect(wrapper.find('[data-testid="item-container"]').exists()).toBe(false);
    });
});
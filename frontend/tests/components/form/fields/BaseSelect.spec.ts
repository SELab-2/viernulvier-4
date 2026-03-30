import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSelect from "../../../../app/components/form/fields/BaseSelect.vue";

describe("BaseSelect", () => {
    let wrapper: ReturnType<typeof mount>;
    const options = ["Option A", "Option B", "Option C"];

    beforeEach(() => {
        wrapper = mount(BaseSelect, {
            props: {
                label: "Category",
                required: true,
                options,
            },
        });
    });

    it("renders the label", () => {
        expect(wrapper.find("label").text()).toContain("Category");
    });

    it("shows required star when required", () => {
        expect(wrapper.find("label").text()).toContain("*");
    });

    it("does not show required star when not required", async () => {
        await wrapper.setProps({ required: false });
        expect(wrapper.find("label").text()).not.toContain("*");
    });

    it("does not render label when not provided", () => {
        const w = mount(BaseSelect, { props: { options } });
        expect(w.find("label").exists()).toBe(false);
    });

    it("renders all options", () => {
        const renderedOptions = wrapper.findAll("option").map(o => o.text());
        expect(renderedOptions).toEqual(expect.arrayContaining(options));
    });

    it("renders a placeholder option by default", () => {
        const placeholder = wrapper.find("option[disabled]");
        expect(placeholder.exists()).toBe(true);
        expect(placeholder.text()).toContain("Select an option");
    });

    it("emits update:modelValue when an option is selected", async () => {
        await wrapper.find("select").setValue("Option A");
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Option A"]);
    });

    it("select is required when required prop is set", () => {
        expect(wrapper.find("select").attributes("required")).toBeDefined();
    });

    it("select is not required when required prop is not set", () => {
        const w = mount(BaseSelect, { props: { options } });
        expect(w.find("select").attributes("required")).toBeUndefined();
    });
});
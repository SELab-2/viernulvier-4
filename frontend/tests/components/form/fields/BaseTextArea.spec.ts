import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseTextArea from "../../../../app/components/form/fields/BaseTextArea.vue";

describe("BaseTextArea", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(BaseTextArea, {
            props: {
                label: "Description",
                placeholder: "Enter description",
                required: true,
            },
        });
    });

    it("renders the label", () => {
        expect(wrapper.find("label").text()).toContain("Description");
    });

    it("renders the placeholder", () => {
        expect(wrapper.find("textarea").attributes("placeholder")).toBe("Enter description");
    });

    it("shows required star when required", () => {
        expect(wrapper.find("label").text()).toContain("*");
    });

    it("does not show required star when not required", async () => {
        await wrapper.setProps({ required: false });
        expect(wrapper.find("label").text()).not.toContain("*");
    });

    it("does not render label when not provided", () => {
        const w = mount(BaseTextArea);
        expect(w.find("label").exists()).toBe(false);
    });

    it("defaults to 5 rows", () => {
        const w = mount(BaseTextArea);
        expect(w.find("textarea").attributes("rows")).toBe("5");
    });

    it("renders with the given number of rows", async () => {
        await wrapper.setProps({ rows: 3 });
        expect(wrapper.find("textarea").attributes("rows")).toBe("3");
    });

    it("emits update:modelValue when text is entered", async () => {
        await wrapper.find("textarea").setValue("Hello world");
        expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Hello world"]);
    });

    it("textarea is required when required prop is set", () => {
        expect(wrapper.find("textarea").attributes("required")).toBeDefined();
    });

    it("textarea is not required when required prop is not set", () => {
        const w = mount(BaseTextArea);
        expect(w.find("textarea").attributes("required")).toBeUndefined();
    });
});
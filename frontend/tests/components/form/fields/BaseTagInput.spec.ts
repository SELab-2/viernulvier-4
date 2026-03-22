import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseTagInput from "../../../../app/components/form/fields/BaseTagInput.vue";

describe("BaseTagInput", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(BaseTagInput, {
            props: {
                label: "Tags",
                placeholder: "Add tags",
                required: true,
            },
        });
    });

    it("renders the label", () => {
        expect(wrapper.find("label").text()).toContain("Tags");
    });

    it("renders the placeholder", () => {
        expect(wrapper.find("input").attributes("placeholder")).toBe("Add tags");
    });

    it("shows required star when required", () => {
        expect(wrapper.find("label").text()).toContain("*");
    });

    it("does not show required star when not required", async () => {
        await wrapper.setProps({ required: false });
        expect(wrapper.find("label").text()).not.toContain("*");
    });

    it("does not render label when not provided", () => {
        const w = mount(BaseTagInput);
        expect(w.find("label").exists()).toBe(false);
    });

    it("adds a tag when Enter is pressed", async () => {
        await wrapper.find("input").setValue("Vue");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });
        expect(wrapper.text()).toContain("Vue");
    });

    it("clears the input after adding a tag", async () => {
        await wrapper.find("input").setValue("Vue");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });
        expect(wrapper.find("input").element.value).toBe("");
    });

    it("does not add duplicate tags", async () => {
        await wrapper.find("input").setValue("Vue");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });
        await wrapper.find("input").setValue("Vue");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });

        const occurrences = wrapper.text().split("Vue").length - 1; // counts how many times "Vue" appears in the rendered text
        // (produces an array with one more element than there are occurences)
        expect(occurrences).toBe(1);
    });

    it("does not add empty tags", async () => {
        await wrapper.find("input").setValue("   ");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });
        expect(wrapper.find('[data-testid="tag-container"]').exists()).toBe(false);
    });

    it("does not show tag list when no tags are added", () => {
        expect(wrapper.find('[data-testid="tag-container"]').exists()).toBe(false);
    });

    it("removes a tag when X is clicked", async () => {
        await wrapper.find("input").setValue("Vue");
        await wrapper.find("input").trigger("keydown", { key: "Enter" });

        await wrapper.find("svg").trigger("click");
        expect(wrapper.text()).not.toContain("Vue");
    });
});
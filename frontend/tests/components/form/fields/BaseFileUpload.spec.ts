import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseFileUpload from "../../../../app/components/form/fields/BaseFileUpload.vue";

const createFile = (name: string, type: string) => // helper function to create a file with a dummy string within
    new File(["content"], name, { type });

describe("BaseFileUpload", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(BaseFileUpload, {
            props: {
                label: "Attachment",
                required: true,
            },
        });
    });

    it("renders the label", () => {
        expect(wrapper.find("label").text()).toContain("Attachment");
    });

    it("shows required star when required", () => {
        expect(wrapper.find("label").text()).toContain("*");
    });

    it("does not show required star when not required", async () => {
        await wrapper.setProps({ required: false });
        expect(wrapper.find("label").text()).not.toContain("*");
    });

    it("does not render label when not provided", () => {
        const w = mount(BaseFileUpload);
        expect(w.find("label").exists()).toBe(false);
    });

    it("renders a file input", () => {
        expect(wrapper.find("input[type='file']").exists()).toBe(true);
    });

    it("does not show file list when no files are selected", () => {
        expect(wrapper.find(".mt-2").exists()).toBe(false);
    });

    it("displays filename after selecting a file", async () => {
        const file = createFile("document.pdf", "application/pdf"); // creating document.pdf
        const input = wrapper.find("input[type='file']");

        Object.defineProperty(input.element, "files", {
            value: [file],
            configurable: true,
        });

        await input.trigger("change");
        expect(wrapper.text()).toContain("document.pdf");
    });

    it("replaces file in single mode when a new file is selected", async () => {
        const file1 = createFile("first.pdf", "application/pdf");
        const file2 = createFile("second.pdf", "application/pdf"); // creating 2 files
        const input = wrapper.find("input[type='file']");

        Object.defineProperty(input.element, "files", { value: [file1], configurable: true }); // simulate user selecting file1 in the file picker
        await input.trigger("change");

        Object.defineProperty(input.element, "files", { value: [file2], configurable: true }); // simulate user selecting file2 in the file picker
        await input.trigger("change");

        expect(wrapper.text()).not.toContain("first.pdf"); // file1 should be gone
        expect(wrapper.text()).toContain("second.pdf");
    });

    it("appends files in multiple mode without duplicates", async () => {
        const w = mount(BaseFileUpload, { props: { multiple: true } });
        const file1 = createFile("first.pdf", "application/pdf");
        const file2 = createFile("second.pdf", "application/pdf");
        const input = w.find("input[type='file']");

        Object.defineProperty(input.element, "files", { value: [file1], configurable: true });
        await input.trigger("change");

        Object.defineProperty(input.element, "files", { value: [file2], configurable: true });
        await input.trigger("change");

        expect(w.text()).toContain("first.pdf");
        expect(w.text()).toContain("second.pdf");
    });

    it("does not add duplicate files in multiple mode", async () => {
        const w = mount(BaseFileUpload, { props: { multiple: true } });
        const file = createFile("same.pdf", "application/pdf");
        const input = w.find("input[type='file']");

        // selecting the same file twice
        Object.defineProperty(input.element, "files", { value: [file], configurable: true });
        await input.trigger("change");
        Object.defineProperty(input.element, "files", { value: [file], configurable: true });
        await input.trigger("change");

        const occurrences = w.text().split("same.pdf").length - 1; // counts how many times "same.pdf" appears in the rendered text
        // (produces an array with one more element than there are occurences)
        expect(occurrences).toBe(1);
    });

    it("removes a file when X is clicked", async () => {
        const file = createFile("document.pdf", "application/pdf");
        const input = wrapper.find("input[type='file']");

        Object.defineProperty(input.element, "files", { value: [file], configurable: true });
        await input.trigger("change");

        await wrapper.find("svg").trigger("click");
        expect(wrapper.text()).not.toContain("document.pdf");
    });
});
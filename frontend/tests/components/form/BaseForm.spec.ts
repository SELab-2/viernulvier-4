import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FormBaseForm from "../../../app/components/form/BaseForm.vue";
import type { FormField } from "../../../app/types/FormField";

const i18n = createI18n({ // needed so no error is thrown when mounted
    locale: "nl",
    messages: {
        nl: { searchbar: { placeholder: "Zoeken..." } },
        en: { searchbar: { placeholder: "Search..." } },
    },
});

const fields: FormField[] = [
    { component: "BaseInput", name: "title", props: { label: "Title", required: true } },
    { component: "BaseTextArea", name: "description", props: { label: "Description" } },
] // each component is already tested separately, there is no need to add them all here

describe("FormBaseForm", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(FormBaseForm, {
            global: { plugins: [i18n] },
            props: { fields },
        });
    });

    it("renders all fields", () => {
        expect(wrapper.find("input").exists()).toBe(true);
        expect(wrapper.find("textarea").exists()).toBe(true);
    });

    it("renders a submit button", () => {
        expect(wrapper.find("button[type='submit']").exists()).toBe(true);
    });

    it("emits submit with form data when submitted", async () => {
        await wrapper.find("input").setValue("Hello");
        await wrapper.find("form").trigger("submit");
        expect(wrapper.emitted("submit")?.[0][0]).toMatchObject({ title: "Hello" });
    });

    it("emits submit even when fields are empty", async () => {
        await wrapper.find("form").trigger("submit");
        expect(wrapper.emitted("submit")).toBeTruthy();
    });

    it("supports multiple instances of the same component", () => {
        const w = mount(FormBaseForm, {
            global: { plugins: [i18n] },
            props: {
                fields: [
                    { component: "BaseInput", name: "first", props: { label: "First" } },
                    { component: "BaseInput", name: "second", props: { label: "Second" } },
                ]
            }
        });
        expect(w.findAll("input").length).toBe(2);
    });
});
import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FormBaseForm from "../../../app/components/form/BaseForm.vue";
import type { FormField } from "../../../app/types/FormField";
import BaseForm from "../../../app/components/form/BaseForm.vue";

const i18n = createI18n({
  // needed so no error is thrown when mounted
  locale: "nl",
  messages: {
    nl: {
      searchbar: { placeholder: "Zoeken..." },
      baseform: {
        submitbutton: "Indienen",
        resetbutton: "Herstellen",
      },
    },
    en: {
      searchbar: { placeholder: "Search..." },
      baseform: {
        submitbutton: "Submit",
        resetbutton: "Reset",
      },
    },
  },
});

const fields: FormField[] = [
  {
    component: "BaseInput",
    name: "title",
    props: { label: "Title", required: true },
  },
  {
    component: "BaseTextArea",
    name: "description",
    props: { label: "Description" },
  },
]; // each component is already tested separately, there is no need to add them all here

describe("FormBaseForm", () => {
  let wrapper: VueWrapper<InstanceType<typeof BaseForm>>;

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
          {
            component: "BaseInput",
            name: "second",
            props: { label: "Second" },
          },
        ],
      },
    });
    expect(w.findAll("input").length).toBe(2);
  });

  it("pre-fills form with initialValues", () => {
    const w = mount(FormBaseForm, {
      global: { plugins: [i18n] },
      props: {
        fields,
        initialValues: { title: "Default title" },
      },
    });
    expect(w.find("input").element.value).toBe("Default title");
  });

  it("renders a reset button", () => {
    // only the reset button has type="button"
    expect(wrapper.find("button[type='button']").exists()).toBe(true);
  });

  it("resets form to empty when reset is clicked", async () => {
    await wrapper.find("input").setValue("Hello");
    await wrapper.find("button[type='button']").trigger("click");
    expect(wrapper.find("input").element.value).toBe("");
  });

  it("resets form to initialValues when reset is clicked", async () => {
    const w = mount(FormBaseForm, {
      global: { plugins: [i18n] },
      props: {
        fields,
        initialValues: { title: "Default title" },
      },
    });
    await w.find("input").setValue("Changed");
    await w.find("button[type='button']").trigger("click");
    expect(w.find("input").element.value).toBe("Default title");
  });
});

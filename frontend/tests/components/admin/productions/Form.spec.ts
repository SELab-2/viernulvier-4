import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import Form from "../../../../app/components/admin/productions/Form.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        "form-title": "Title",
        "form-description1": "Description 1",
        "form-description2": "Description 2",
        "form-tagline": "Tagline",
        "form-credits": "Credits",
        "form-artists": "Artists",
      },
    },
  },
});

interface Field {
  name: string;
  props: {
    required?: boolean;
  };
}

describe("AdminProductionsForm", () => {
  const defaultProps = {
    modelValue: {
      titel: "",
      description1: "",
      description2: "",
      tagline: "",
      credits: "",
      artist: "",
    },
    language: "nl" as const,
  };

  const stubs = {
    FormBaseForm: {
      name: "FormBaseForm",
      template: '<div class="base-form-stub"><slot /></div>',
      props: ["fields", "showActions", "modelValue"],
    },
  };

  it("renders correctly with default props", () => {
    const wrapper = mount(Form, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const baseForm = wrapper.findComponent({ name: "FormBaseForm" });
    expect(baseForm.exists()).toBe(true);
    expect(baseForm.props("showActions")).toBe(false);
    expect(baseForm.props("fields")).toHaveLength(6);
  });

  it("sets required fields for NL language", () => {
    const wrapper = mount(Form, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, language: "nl" },
    });

    const baseForm = wrapper.findComponent({ name: "FormBaseForm" });
    const fields = baseForm.props("fields") as Field[];
    expect(fields.find((f) => f.name === "titel")?.props.required).toBe(true);
    expect(fields.find((f) => f.name === "description1")?.props.required).toBe(
      true,
    );
  });

  it("does not set required fields for EN language", () => {
    const wrapper = mount(Form, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, language: "en" },
    });

    const baseForm = wrapper.findComponent({ name: "FormBaseForm" });
    const fields = baseForm.props("fields") as Field[];
    expect(fields.find((f) => f.name === "titel")?.props.required).toBe(false);
    expect(fields.find((f) => f.name === "description1")?.props.required).toBe(
      false,
    );
  });

  it("emits update:modelValue when FormBaseForm emits it", async () => {
    const wrapper = mount(Form, {
      global: {
        plugins: [i18n],
        stubs: {
          FormBaseForm: {
            template:
              "<button @click=\"$emit('update:modelValue', { titel: 'New' })\">Update</button>",
            name: "FormBaseForm",
          },
        },
      },
      props: defaultProps,
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([
      { titel: "New" },
    ]);
  });
});

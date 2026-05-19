import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import ItemMetadata from "../../../../app/components/admin/blogs/ItemMetadata.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          image: {
            metadataTitle: "Metadata",
            itemTitleNl: "Title NL",
            itemTitleEn: "Title EN",
            itemCreditsNl: "Credits NL",
            itemCreditsEn: "Credits EN",
          },
        },
        save: "Save",
        saving: "Saving...",
      },
    },
  },
});

describe("AdminBlogsItemMetadata", () => {
  const defaultProps = {
    disabled: false,
    saving: false,
    titleNl: "Titel NL",
    titleEn: "Title EN",
    creditsNl: "Credits NL",
    creditsEn: "Credits EN",
  };

  const stubs = {
    FormSectionsSectionCard: {
      template: "<div><slot /></div>",
      props: ["title"],
    },
    FormFieldsBaseInput: {
      template:
        '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      props: ["modelValue", "label"],
    },
  };

  it("renders correctly with provided values", () => {
    const wrapper = mount(ItemMetadata, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("Save");
    const inputs = wrapper.findAll("input");
    expect(inputs[0].element.value).toBe("Titel NL");
    expect(inputs[1].element.value).toBe("Title EN");
    expect(inputs[2].element.value).toBe("Credits NL");
    expect(inputs[3].element.value).toBe("Credits EN");
  });

  it("emits save when button is clicked", async () => {
    const wrapper = mount(ItemMetadata, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("save")).toBeTruthy();
  });

  it("disables button when disabled prop is true", () => {
    const wrapper = mount(ItemMetadata, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, disabled: true },
    });

    expect(wrapper.find("button").element.disabled).toBe(true);
  });

  it("shows saving text and disables button when saving prop is true", () => {
    const wrapper = mount(ItemMetadata, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, saving: true },
    });

    expect(wrapper.text()).toContain("Saving...");
    expect(wrapper.find("button").element.disabled).toBe(true);
  });

  it("updates models when inputs change", async () => {
    const wrapper = mount(ItemMetadata, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("New Title NL");
    expect(wrapper.emitted("update:titleNl")?.[0]).toEqual(["New Title NL"]);

    await inputs[1].setValue("New Title EN");
    expect(wrapper.emitted("update:titleEn")?.[0]).toEqual(["New Title EN"]);

    await inputs[2].setValue("New Credits NL");
    expect(wrapper.emitted("update:creditsNl")?.[0]).toEqual([
      "New Credits NL",
    ]);

    await inputs[3].setValue("New Credits EN");
    expect(wrapper.emitted("update:creditsEn")?.[0]).toEqual([
      "New Credits EN",
    ]);
  });
});

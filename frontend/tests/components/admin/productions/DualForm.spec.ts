import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import type { ProductionCoreForm } from "~/composables/productions/steps/productionCore";
import DualForm from "../../../../app/components/admin/productions/DualForm.vue";

describe("AdminProductionsDualForm", () => {
  const defaultProps = {
    modelValue: {
      nl: {
        titel: "NL Title",
        description1: "NL Desc 1",
        description2: "",
        tagline: "",
        credits: "",
        artist: "",
      },
      en: {
        titel: "EN Title",
        description1: "EN Desc 1",
        description2: "",
        tagline: "",
        credits: "",
        artist: "",
      },
    },
  };

  const stubs = {
    AdminProductionsForm: {
      name: "AdminProductionsForm",
      template: '<div class="prod-form-stub"><slot /></div>',
      props: ["language", "modelValue"],
    },
  };

  it("renders correctly with NL active by default", () => {
    const wrapper = mount(DualForm, {
      global: {
        stubs,
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].text()).toBe("NL");
    expect(buttons[1].text()).toBe("EN");
    expect(buttons[0].classes()).toContain("bg-foreground");

    const forms = wrapper.findAllComponents({ name: "AdminProductionsForm" });
    expect(forms).toHaveLength(2);
    expect(forms[0].props("language")).toBe("nl");
    expect(forms[0].props("modelValue")).toEqual(defaultProps.modelValue.nl);
  });

  it("switches language when tab is clicked", async () => {
    const wrapper = mount(DualForm, {
      global: {
        stubs,
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    await buttons[1].trigger("click"); // Click EN

    expect(buttons[1].classes()).toContain("bg-foreground");
    expect(buttons[0].classes()).not.toContain("bg-foreground");
  });

  it("emits update:modelValue when a sub-form updates", async () => {
    const wrapper = mount(DualForm, {
      global: {
        stubs: {
          AdminProductionsForm: {
            template:
              "<button @click=\"$emit('update:modelValue', { titel: 'Updated' })\">Update</button>",
            name: "AdminProductionsForm",
            props: ["language"],
          },
        },
      },
      props: defaultProps,
    });

    // Both forms are rendered, but we trigger the first one (NL)
    await wrapper.findAll("button")[2].trigger("click"); // The first button from stubbed forms

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionCoreForm;
    expect(emitted.nl.titel).toBe("Updated");
    expect(emitted.en.titel).toBe("EN Title"); // EN remains unchanged
  });
});

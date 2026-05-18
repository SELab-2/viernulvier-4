import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Form from "../../../../app/components/admin/blogs/Form.vue";

describe("AdminBlogsForm", () => {
  const stubs = {
    FormSectionsTitleSection: {
      template: `
        <div>
          <input :value="titelNl" @input="$emit('update:titelNl', $event.target.value)" class="titel-nl" />
          <input :value="titelEn" @input="$emit('update:titelEn', $event.target.value)" class="titel-en" />
        </div>
      `,
      props: ["titelNl", "titelEn"],
    },
    FormSectionsDescriptionSection: {
      template: `
        <div>
          <textarea :value="descriptionNl" @input="$emit('update:descriptionNl', $event.target.value)" class="desc-nl"></textarea>
          <textarea :value="descriptionEn" @input="$emit('update:descriptionEn', $event.target.value)" class="desc-en"></textarea>
        </div>
      `,
      props: ["descriptionNl", "descriptionEn", "richText"],
    },
    FormActions: {
      name: "FormActions",
      template: `
        <div>
          <button class="submit-btn" @click="$emit('submit')">Submit</button>
          <button class="reset-btn" @click="$emit('reset')">Reset</button>
        </div>
      `,
      props: ["isValid", "loading", "mode", "backUrl", "showRestore"],
    },
  };

  it("renders correctly in create mode", () => {
    const wrapper = mount(Form, {
      global: { stubs },
      props: { mode: "create" },
    });

    expect(wrapper.findComponent({ name: "FormActions" }).props("mode")).toBe(
      "create",
    );
  });

  it("populates fields from initialData", () => {
    const initialData = {
      titel: { nl: "NL Title", en: "EN Title" },
      description: { nl: "NL Desc", en: "EN Desc" },
    };
    const wrapper = mount(Form, {
      global: { stubs },
      props: { initialData },
    });

    expect(
      (wrapper.find("input.titel-nl").element as HTMLInputElement).value,
    ).toBe("NL Title");
    expect(
      (wrapper.find("textarea.desc-nl").element as HTMLTextAreaElement).value,
    ).toBe("NL Desc");
  });

  it("emits submit with correct data when valid", async () => {
    const wrapper = mount(Form, {
      global: { stubs },
    });

    await wrapper.find("input.titel-nl").setValue("New Title");
    await wrapper.find("textarea.desc-nl").setValue("New Description");

    await wrapper.find("button.submit-btn").trigger("click");

    expect(wrapper.emitted("submit")?.[0][0]).toEqual({
      titel: { nl: "New Title", en: "New Title" },
      description: { nl: "New Description", en: "New Description" },
    });
  });

  it("is invalid if required fields are empty", async () => {
    const wrapper = mount(Form, {
      global: { stubs },
    });

    expect(
      wrapper.findComponent({ name: "FormActions" }).props("isValid"),
    ).toBe(false);

    await wrapper.find("input.titel-nl").setValue("Title");
    expect(
      wrapper.findComponent({ name: "FormActions" }).props("isValid"),
    ).toBe(false);

    await wrapper.find("textarea.desc-nl").setValue("Desc");
    expect(
      wrapper.findComponent({ name: "FormActions" }).props("isValid"),
    ).toBe(true);
  });

  it("handles reset", async () => {
    const wrapper = mount(Form, {
      global: { stubs },
    });

    await wrapper.find("input.titel-nl").setValue("Title");
    await wrapper.find("button.reset-btn").trigger("click");

    expect(
      (wrapper.find("input.titel-nl").element as HTMLInputElement).value,
    ).toBe("");
    expect(wrapper.emitted("reset")).toBeTruthy();
  });

  it("emits preview-update when fields change", async () => {
    const wrapper = mount(Form, {
      global: { stubs },
    });

    await wrapper.find("input.titel-nl").setValue("P Title");

    expect(wrapper.emitted("preview-update")).toBeTruthy();
    expect(wrapper.emitted("preview-update")?.slice(-1)[0][0]).toMatchObject({
      titel: { nl: "P Title" },
    });
  });
});

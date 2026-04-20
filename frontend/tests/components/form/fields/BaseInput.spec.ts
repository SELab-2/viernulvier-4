import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import BaseInput from "../../../../app/components/form/fields/BaseInput.vue";

describe("BaseInput", () => {
  let wrapper: VueWrapper<InstanceType<typeof BaseInput>>;

  beforeEach(() => {
    wrapper = mount(BaseInput, {
      props: {
        label: "Title",
        placeholder: "Enter title",
        required: true,
      },
    });
  });

  it("renders the label", () => {
    expect(wrapper.find("label").text()).toContain("Title");
  });

  it("renders the placeholder", () => {
    expect(wrapper.find("input").attributes("placeholder")).toBe("Enter title");
  });

  it("shows required star when required", () => {
    expect(wrapper.find("label").text()).toContain("*");
  });

  it("does not show required star when not required", async () => {
    await wrapper.setProps({ required: false });
    expect(wrapper.find("label").text()).not.toContain("*");
  });

  it("does not render label when not provided", () => {
    const w = mount(BaseInput);
    expect(w.find("label").exists()).toBe(false);
  });

  it("defaults to text input type", () => {
    expect(wrapper.find("input").attributes("type")).toBe("text");
  });

  it("renders as number input when type is number", async () => {
    await wrapper.setProps({ type: "number" });
    expect(wrapper.find("input").attributes("type")).toBe("number");
  });

  it("emits update:modelValue when text is entered", async () => {
    await wrapper.find("input").setValue("Hello");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Hello"]);
  });

  it("input is required when required prop is set", () => {
    expect(wrapper.find("input").attributes("required")).toBeDefined();
  });

  it("input is not required when required prop is not set", () => {
    const w = mount(BaseInput);
    expect(w.find("input").attributes("required")).toBeUndefined();
  });

  it("sets minlength when minLength prop is provided", () => {
    const w = mount(BaseInput, {
      props: {
        minLength: 8,
      },
    });

    expect(w.find("input").attributes("minlength")).toBe("8");
  });

  it("does not set minlength when minLength prop is not provided", () => {
    const w = mount(BaseInput);
    expect(w.find("input").attributes("minlength")).toBeUndefined();
  });

  it("shows password toggle only when type is password", async () => {
    const w = mount(BaseInput, {
      props: {
        type: "password",
      },
    });

    expect(w.find("button[type='button']").exists()).toBe(true);

    await w.setProps({ type: "text" });
    expect(w.find("button[type='button']").exists()).toBe(false);
  });

  it("toggles input type when password visibility button is clicked", async () => {
    const w = mount(BaseInput, {
      props: {
        type: "password",
      },
    });

    const input = w.find("input");
    const toggle = w.find("button[type='button']");

    expect(input.attributes("type")).toBe("password");

    await toggle.trigger("click");
    expect(input.attributes("type")).toBe("text");

    await toggle.trigger("click");
    expect(input.attributes("type")).toBe("password");
  });
});

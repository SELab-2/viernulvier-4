import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import BaseDate from "../../../../app/components/form/fields/BaseDate.vue";

describe("BaseDate", () => {
  let wrapper: VueWrapper<InstanceType<typeof BaseDate>>;

  beforeEach(() => {
    wrapper = mount(BaseDate, {
      props: {
        label: "Due Date",
        required: true,
      },
      global: {
        stubs: {
          Calendar: true,
        },
      },
    });
  });

  it("renders the label", () => {
    expect(wrapper.find("label").text()).toContain("Due Date");
  });

  it("shows required star when required", () => {
    expect(wrapper.find("label").text()).toContain("*");
  });

  it("does not show required star when not required", async () => {
    await wrapper.setProps({ required: false });
    expect(wrapper.find("label").text()).not.toContain("*");
  });

  it("does not render label when not provided", () => {
    const w = mount(BaseDate, {
      global: {
        stubs: {
          Calendar: true,
        },
      },
    });
    expect(w.find("label").exists()).toBe(false);
  });

  it("renders an input of type date", () => {
    expect(wrapper.find("input").attributes("type")).toBe("date");
  });

  it("emits update:modelValue when a date is entered", async () => {
    await wrapper.find("input").setValue("2026-03-22");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["2026-03-22"]);
  });

  it("input is required when required prop is set", () => {
    expect(wrapper.find("input").attributes("required")).toBeDefined();
  });

  it("input is not required when required prop is not set", () => {
    const w = mount(BaseDate, {
      global: {
        stubs: {
          Calendar: true,
        },
      },
    });
    expect(w.find("input").attributes("required")).toBeUndefined();
  });
});

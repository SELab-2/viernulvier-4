import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TagPill from "../../app/components/TagPill.vue";

describe("TagPill", () => {
  it("renders label as span by default", () => {
    const wrapper = mount(TagPill, {
      props: { label: "Test Tag" },
    });

    expect(wrapper.element).toBeInstanceOf(HTMLSpanElement);
    expect(wrapper.text()).toBe("Test Tag");
    expect(wrapper.classes()).toContain("h-8"); // default not compact
  });

  it("renders as button when clickable prop is true", () => {
    const wrapper = mount(TagPill, {
      props: { label: "Clickable Tag", clickable: true },
    });

    expect(wrapper.element).toBeInstanceOf(HTMLButtonElement);
    expect(wrapper.classes()).toContain("cursor-pointer");
  });

  it("renders compactly when compact prop is true", () => {
    const wrapper = mount(TagPill, {
      props: { label: "Compact Tag", compact: true },
    });

    expect(wrapper.classes()).toContain("h-6");
    expect(wrapper.classes()).not.toContain("h-8");
  });
});

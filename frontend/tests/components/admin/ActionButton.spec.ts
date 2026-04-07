import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ActionButton from "../../../app/components/admin/ActionButton.vue";

describe("ActionButton", () => {
  it("renders with default size and gray variant", () => {
    const wrapper = mount(ActionButton, {
      props: { label: "Upload" },
      slots: { default: "icon" },
    });

    const button = wrapper.find('[aria-label="Upload"]');
    const style = button.attributes("style");
    const classes = button.attributes("class");

    expect(style).toContain("width: 44px");
    expect(style).toContain("height: 44px");
    expect(classes).toContain("border-action-gray-border");
    expect(classes).toContain("text-action-gray-icon");
    expect(classes).toContain("hover:bg-action-gray-hover");
  });

  it("applies custom variant and size", () => {
    const wrapper = mount(ActionButton, {
      props: { label: "Upload", variant: "green", size: 36 },
      slots: { default: "icon" },
    });

    const button = wrapper.find('[aria-label="Upload"]');
    const style = button.attributes("style");
    const classes = button.attributes("class");

    expect(style).toContain("width: 36px");
    expect(style).toContain("height: 36px");
    expect(classes).toContain("border-action-green-border");
    expect(classes).toContain("text-action-green-icon");
    expect(classes).toContain("hover:bg-action-green-hover");
  });

  it("emits click", async () => {
    const wrapper = mount(ActionButton, {
      props: { label: "Upload" },
      slots: { default: "icon" },
    });

    await wrapper.find('[aria-label="Upload"]').trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});

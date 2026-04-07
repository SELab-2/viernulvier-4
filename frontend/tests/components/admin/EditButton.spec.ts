import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import EditButton from "../../../app/components/admin/EditButton.vue";

describe("EditButton", () => {
  it("renders button with label", () => {
    const wrapper = mount(EditButton, {
      props: {
        label: "Edit",
      },
    });

    expect(wrapper.find('[aria-label="Edit"]').exists()).toBe(true);
  });

  it("emits click event", async () => {
    const wrapper = mount(EditButton, {
      props: {
        label: "Edit",
      },
    });

    await wrapper.find('[aria-label="Edit"]').trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("uses default pixel size", () => {
    const wrapper = mount(EditButton, {
      props: {
        label: "Edit",
      },
    });

    const style = wrapper.find('[aria-label="Edit"]').attributes("style");
    expect(style).toContain("width: 44px");
    expect(style).toContain("height: 44px");
  });

  it("applies custom pixel size", () => {
    const wrapper = mount(EditButton, {
      props: {
        label: "Edit",
        size: 36,
      },
    });

    const style = wrapper.find('[aria-label="Edit"]').attributes("style");
    expect(style).toContain("width: 36px");
    expect(style).toContain("height: 36px");
  });
});

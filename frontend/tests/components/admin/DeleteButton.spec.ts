import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DeleteButton from "../../../app/components/admin/DeleteButton.vue";

describe("DeleteButton", () => {
  it("renders button with label", () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "Delete",
      },
    });

    expect(wrapper.find('[aria-label="Delete"]').exists()).toBe(true);
  });

  it("emits click event", async () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "Delete",
      },
    });

    await wrapper.find('[aria-label="Delete"]').trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("uses default pixel size", () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "Delete",
      },
    });

    const style = wrapper.find('[aria-label="Delete"]').attributes("style");
    expect(style).toContain("width: 44px");
    expect(style).toContain("height: 44px");
  });

  it("applies custom pixel size", () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "Delete",
        size: 36,
      },
    });

    const style = wrapper.find('[aria-label="Delete"]').attributes("style");
    expect(style).toContain("width: 36px");
    expect(style).toContain("height: 36px");
  });

  it("renders text mode without icon sizing styles", () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "REMOVE",
        mode: "text",
      },
    });

    const button = wrapper.find('[aria-label="REMOVE"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("REMOVE");
    expect(button.attributes("style")).toBeUndefined();
  });

  it("emits click in text mode", async () => {
    const wrapper = mount(DeleteButton, {
      props: {
        label: "REMOVE",
        mode: "text",
      },
    });

    await wrapper.find('[aria-label="REMOVE"]').trigger("click");

    expect(wrapper.emitted("click")).toHaveLength(1);
  });
});

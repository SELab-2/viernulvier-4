import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PageHeader from "../../app/components/PageHeader.vue";

describe("PageHeader", () => {
  it("renders the title", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Test Page Title" },
    });

    expect(wrapper.text()).toContain("Test Page Title");
  });

  it("renders the description when provided", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Title", description: "Test Description" },
    });

    expect(wrapper.text()).toContain("Test Description");
  });

  it("renders slot content in the actions area", () => {
    const wrapper = mount(PageHeader, {
      props: { title: "Title" },
      slots: {
        actions: '<button id="test-btn">Action</button>',
      },
    });

    expect(wrapper.find("#test-btn").exists()).toBe(true);
    expect(wrapper.find("#test-btn").text()).toBe("Action");
  });
});

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SectionCard from "../../../../app/components/form/sections/SectionCard.vue";

describe("SectionCard", () => {
  it("renders the title", () => {
    const wrapper = mount(SectionCard, {
      props: { title: "Section Title" },
    });

    expect(wrapper.text()).toContain("Section Title");
  });

  it("renders the subtitle when provided", () => {
    const wrapper = mount(SectionCard, {
      props: { title: "Title", subtitle: "Optional Subtitle" },
    });

    expect(wrapper.text()).toContain("Optional Subtitle");
  });

  it("renders default slot content", () => {
    const wrapper = mount(SectionCard, {
      props: { title: "Title" },
      slots: {
        default: '<div id="slotted-content">Content</div>',
      },
    });

    expect(wrapper.find("#slotted-content").exists()).toBe(true);
    expect(wrapper.find("#slotted-content").text()).toBe("Content");
  });
});

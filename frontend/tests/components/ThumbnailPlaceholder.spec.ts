import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ThumbnailPlaceholder from "../../app/components/ThumbnailPlaceholder.vue";

describe("ThumbnailPlaceholder", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(ThumbnailPlaceholder, {
      props: {
        showIcon: true,
        showBorder: true,
        rounded: true,
      },
    });

    expect(wrapper.find("svg").exists()).toBe(true);
    expect(wrapper.classes()).toContain("rounded-lg");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("w-48"); // default md
  });

  it("applies correct size classes", () => {
    const fillWrapper = mount(ThumbnailPlaceholder, {
      props: { size: "fill" },
    });
    expect(fillWrapper.classes()).toContain("w-full");

    const smWrapper = mount(ThumbnailPlaceholder, { props: { size: "sm" } });
    expect(smWrapper.classes()).toContain("w-32");

    const lgWrapper = mount(ThumbnailPlaceholder, { props: { size: "lg" } });
    expect(lgWrapper.classes()).toContain("w-72");
  });

  it("hides icon when showIcon is false", () => {
    const wrapper = mount(ThumbnailPlaceholder, {
      props: { showIcon: false },
    });

    expect(wrapper.find("svg").exists()).toBe(false);
  });

  it("disables border and rounding when requested", () => {
    const wrapper = mount(ThumbnailPlaceholder, {
      props: { showBorder: false, rounded: false },
    });

    expect(wrapper.classes()).not.toContain("rounded-lg");
    expect(wrapper.classes()).not.toContain("border");
  });

  it("applies a gradient based on id", () => {
    const wrapper1 = mount(ThumbnailPlaceholder, { props: { id: 1 } });
    const wrapper2 = mount(ThumbnailPlaceholder, { props: { id: 2 } });

    // The inner div has the style
    const inner1 = wrapper1.find("div.w-full.h-full");
    const inner2 = wrapper2.find("div.w-full.h-full");

    const style1 = inner1.attributes("style");
    const style2 = inner2.attributes("style");

    expect(style1).toContain("background");
    expect(style2).toContain("background");
    expect(style1).not.toBe(style2);
  });
});

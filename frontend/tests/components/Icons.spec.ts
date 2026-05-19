import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FacebookSVG from "../../app/components/icons/FacebookSVG.vue";
import InstagramSVG from "../../app/components/icons/InstagramSVG.vue";
import LinkedinSVG from "../../app/components/icons/LinkedinSVG.vue";
import TiktokSVG from "../../app/components/icons/TiktokSVG.vue";
import YoutubeSVG from "../../app/components/icons/YoutubeSVG.vue";

describe("Icons", () => {
  it("FacebookSVG renders correctly", () => {
    const wrapper = mount(FacebookSVG);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("InstagramSVG renders correctly", () => {
    const wrapper = mount(InstagramSVG);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("LinkedinSVG renders correctly", () => {
    const wrapper = mount(LinkedinSVG);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("TiktokSVG renders correctly", () => {
    const wrapper = mount(TiktokSVG);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("YoutubeSVG renders correctly", () => {
    const wrapper = mount(YoutubeSVG);
    expect(wrapper.find("svg").exists()).toBe(true);
  });
});

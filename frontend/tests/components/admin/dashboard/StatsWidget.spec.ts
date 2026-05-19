import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatsWidget from "../../../../app/components/admin/dashboard/StatsWidget.vue";

describe("StatsWidget", () => {
  it("renders label and icon correctly", () => {
    const wrapper = mount(StatsWidget, {
      props: {
        label: "Total Productions",
        count: 123,
        loading: false,
        icon: "🎬",
      },
    });

    expect(wrapper.text()).toContain("Total Productions");
    expect(wrapper.text()).toContain("🎬");
    expect(wrapper.text()).toContain("123");
  });

  it("shows skeleton while loading", () => {
    const wrapper = mount(StatsWidget, {
      props: {
        label: "Total Productions",
        count: null,
        loading: true,
        icon: "🎬",
      },
    });

    expect(wrapper.find(".animate-pulse").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("—");
  });

  it("shows dash when count is null and not loading", () => {
    const wrapper = mount(StatsWidget, {
      props: {
        label: "Total Productions",
        count: null,
        loading: false,
        icon: "🎬",
      },
    });

    expect(wrapper.text()).toContain("—");
  });
});

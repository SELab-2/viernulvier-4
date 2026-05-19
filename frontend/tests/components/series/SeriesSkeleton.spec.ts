import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SeriesSkeleton from "../../../app/components/series/SeriesSkeleton.vue";

describe("SeriesSkeleton", () => {
  it("renders correct number of skeleton items", () => {
    const wrapper = mount(SeriesSkeleton);
    // It has 20 skeleton items
    expect(wrapper.findAll(".animate-pulse")).toHaveLength(61); // 1 header + 20 * 3 items
  });

  it("has aria-busy attribute", () => {
    const wrapper = mount(SeriesSkeleton);
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });
});

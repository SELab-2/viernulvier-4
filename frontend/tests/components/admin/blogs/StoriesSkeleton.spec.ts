import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StoriesSkeleton from "../../../../app/components/admin/blogs/StoriesSkeleton.vue";

describe("AdminBlogsStoriesSkeleton", () => {
  it("renders correctly", () => {
    const wrapper = mount(StoriesSkeleton);
    expect(wrapper.attributes("aria-busy")).toBe("true");
    expect(wrapper.findAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});

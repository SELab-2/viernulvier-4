import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Feedback from "../../../../../app/components/admin/blogs/image/Feedback.vue";

describe("Feedback", () => {
  it("renders success feedback correctly", () => {
    const wrapper = mount(Feedback, {
      props: {
        feedback: { type: "ok", msg: "Upload successful" },
      },
    });

    expect(wrapper.text()).toContain("Upload successful");
    expect(wrapper.classes()).not.toContain("border-feedback-error-border");
    // Depending on how classes are rendered, we might need a more specific check if needed
  });

  it("renders error feedback correctly", () => {
    const wrapper = mount(Feedback, {
      props: {
        feedback: { type: "err", msg: "Upload failed" },
      },
    });

    expect(wrapper.text()).toContain("Upload failed");
  });

  it("does not render when feedback is null", () => {
    const wrapper = mount(Feedback, {
      props: {
        feedback: null,
      },
    });

    expect(wrapper.find("div").exists()).toBe(false);
  });
});

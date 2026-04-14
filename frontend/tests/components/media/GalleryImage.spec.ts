import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GalleryImage from "../../../app/components/media/GalleryImage.vue";
import ThumbnailPlaceholder from "../../../app/components/ThumbnailPlaceholder.vue";

vi.mock("#imports", () => ({
  formatUrl: vi.fn((url: string) => `https://cdn.example.com/${url}`),
}));

describe("GalleryImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the image with formatted url when a valid crop is provided", () => {
    const wrapper = mount(GalleryImage, {
      props: {
        crop: {
          id: 1,
          url: "test-image.jpg",
          name: "hd_ready",
          created_at: "",
          updated_at: "",
        },
      },
      global: {
        stubs: { ThumbnailPlaceholder: true }, // Stub child component
      },
    });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);

    // Ensure placeholder is NOT rendered
    expect(wrapper.findComponent(ThumbnailPlaceholder).exists()).toBe(false);
  });

  it("renders the ThumbnailPlaceholder when crop is null", () => {
    const wrapper = mount(GalleryImage, {
      props: {
        crop: null,
        objectId: 42,
      },
      global: {
        stubs: { ThumbnailPlaceholder: true },
      },
    });

    expect(wrapper.find("img").exists()).toBe(false);

    const placeholder = wrapper.findComponent(ThumbnailPlaceholder);
    expect(placeholder.exists()).toBe(true);
    // Check if props are passed down correctly
    expect(placeholder.props("id")).toBe(42);
  });

  it("falls back to ThumbnailPlaceholder when the image fails to load", async () => {
    const wrapper = mount(GalleryImage, {
      props: {
        crop: {
          id: 1,
          url: "broken-image.jpg",
          name: "hd_ready",
          created_at: "",
          updated_at: "",
        },
      },
      global: {
        stubs: { ThumbnailPlaceholder: true },
      },
    });

    // Image initially exists
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);

    // Simulate the browser failing to load the image
    await img.trigger("error");

    // Image should be gone, placeholder should appear
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.findComponent(ThumbnailPlaceholder).exists()).toBe(true);
  });

  it("resets the error state if the crop url changes", async () => {
    const wrapper = mount(GalleryImage, {
      props: {
        crop: {
          id: 1,
          url: "broken.jpg",
          name: "hd_ready",
          created_at: "",
          updated_at: "",
        },
      },
      global: {
        stubs: { ThumbnailPlaceholder: true },
      },
    });

    // Trigger error state
    await wrapper.find("img").trigger("error");
    expect(wrapper.find("img").exists()).toBe(false);

    // Change the crop URL (triggering the watch)
    await wrapper.setProps({
      crop: {
        id: 2,
        url: "fixed.jpg",
        name: "hd_ready",
        created_at: "",
        updated_at: "",
      },
    });

    // Error state should be reset, image should render again
    expect(wrapper.find("img").exists()).toBe(true);
    expect(wrapper.findComponent(ThumbnailPlaceholder).exists()).toBe(false);
  });

  describe("containerClass computations", () => {
    it("applies default sizing and rounded classes", () => {
      const wrapper = mount(GalleryImage, {
        props: {
          crop: {
            id: 1,
            url: "test.jpg",
            name: "hd_ready",
            created_at: "",
            updated_at: "",
          },
        },
      });

      const classes = wrapper.find("img").classes();
      expect(classes).toContain("w-48");
      expect(classes).toContain("h-32");
    });

    it("applies exact size classes when size prop is provided", () => {
      const wrapper = mount(GalleryImage, {
        props: {
          crop: {
            id: 1,
            url: "test.jpg",
            name: "hd_ready",
            created_at: "",
            updated_at: "",
          },
          size: "fill",
        },
      });

      const classes = wrapper.find("img").classes();
      expect(classes).toContain("w-full");
      expect(classes).toContain("h-full");
    });

    it("removes rounded class when rounded prop is false", () => {
      const wrapper = mount(GalleryImage, {
        props: {
          crop: {
            id: 1,
            url: "test.jpg",
            name: "hd_ready",
            created_at: "",
            updated_at: "",
          },
          rounded: false,
        },
      });

      expect(wrapper.find("img").classes()).not.toContain("rounded-lg");
    });
  });
});

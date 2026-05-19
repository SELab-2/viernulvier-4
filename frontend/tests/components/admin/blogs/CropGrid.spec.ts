import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import CropGrid from "../../../../app/components/admin/blogs/CropGrid.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          image: {
            uploaded: "Uploaded",
          },
        },
      },
    },
  },
});

describe("AdminBlogsCropGrid", () => {
  const defaultProps = {
    blogId: 1,
    existingCrops: {},
    uploadingCrop: null,
    deletingCrop: null,
    loading: false,
  };

  const stubs = {
    AdminBlogsCropSlot: {
      template: "<div><slot /></div>",
      name: "AdminBlogsCropSlot",
    },
  };

  it("renders correctly and shows skeleton when loading", () => {
    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs: {
          AdminBlogsCropSlot: true,
        },
      },
      props: { ...defaultProps, loading: true },
    });

    expect(wrapper.findAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(wrapper.findComponent({ name: "AdminBlogsCropSlot" }).exists()).toBe(
      false,
    );
  });

  it("renders 6 crop slots when not loading", () => {
    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs: {
          AdminBlogsCropSlot: true,
        },
      },
      props: defaultProps,
    });

    expect(
      wrapper.findAllComponents({ name: "AdminBlogsCropSlot" }).length,
    ).toBe(6);
  });

  it("shows correct uploaded count in the progress ring", () => {
    const existingCrops: Record<string, { id: number }> = {
      hd_ready: { id: 1 },
      thumbnail: { id: 2 },
    };

    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, existingCrops },
    });

    expect(wrapper.text()).toContain("2/6 Uploaded");
  });

  it("emits delete when a CropSlot emits delete", async () => {
    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs: {
          AdminBlogsCropSlot: {
            template:
              "<div><button @click=\"$emit('delete')\">Delete</button><slot /></div>",
            name: "AdminBlogsCropSlot",
          },
        },
      },
      props: defaultProps,
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("delete")?.[0]).toEqual(["hd_ready"]);
  });

  it("triggers file input click when CropSlot emits trigger-upload", async () => {
    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs: {
          AdminBlogsCropSlot: {
            template:
              "<div><button @click=\"$emit('trigger-upload')\">Upload</button><slot /></div>",
            name: "AdminBlogsCropSlot",
          },
        },
      },
      props: defaultProps,
    });

    const hdReadyInput = wrapper.find('input[type="file"]');
    const spy = vi.spyOn(hdReadyInput.element as HTMLInputElement, "click");

    await wrapper.find("button").trigger("click");
    expect(spy).toHaveBeenCalled();
  });

  it("emits upload when file input changes", async () => {
    const wrapper = mount(CropGrid, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = wrapper.find('input[type="file"]');

    // Create a FileList-like object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    (input.element as HTMLInputElement).files = dataTransfer.files;

    await input.trigger("change");

    expect(wrapper.emitted("upload")?.[0]).toEqual(["hd_ready", file]);
  });
});

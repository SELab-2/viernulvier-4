import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import CropSlot from "../../../../app/components/admin/blogs/CropSlot.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          image: {
            uploaded: "Uploaded",
            replace: "Replace",
            upload: "Upload",
          },
        },
        delete: "Delete",
      },
    },
  },
});

describe("AdminBlogsCropSlot", () => {
  const defaultProps = {
    cropName: "hd_ready",
    label: "Main Image",
    hint: "1920x1080",
    crop: null,
    uploading: false,
    deleting: false,
    blogId: 1,
  };

  it("renders correctly without crop", () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("Main Image");
    expect(wrapper.text()).toContain("1920x1080");
    expect(wrapper.text()).toContain("Upload");
    expect(wrapper.find('button[title="Delete"]').exists()).toBe(false);
  });

  it("renders correctly with crop", () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: {
        ...defaultProps,
        crop: { id: 1, name: "hd_ready", url: "test.jpg" } as any,
      },
    });

    expect(wrapper.text()).toContain("Uploaded");
    expect(wrapper.text()).toContain("Replace");
    expect(wrapper.find('button[title="Delete"]').exists()).toBe(true);
  });

  it("emits trigger-upload when upload button is clicked", async () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: defaultProps,
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("trigger-upload")).toBeTruthy();
  });

  it("emits delete when delete button is clicked", async () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: {
        ...defaultProps,
        crop: { id: 1, name: "hd_ready", url: "test.jpg" } as any,
      },
    });

    await wrapper.find('button[title="Delete"]').trigger("click");
    expect(wrapper.emitted("delete")).toBeTruthy();
  });

  it("shows spinner when uploading", () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: {
        ...defaultProps,
        uploading: true,
      },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
    expect(wrapper.find("button").element.disabled).toBe(true);
  });

  it("shows spinner when deleting", () => {
    const wrapper = mount(CropSlot, {
      global: {
        plugins: [i18n],
        stubs: {
          MediaDisplay: true,
        },
      },
      props: {
        ...defaultProps,
        crop: { id: 1 } as any,
        deleting: true,
      },
    });

    expect(wrapper.find(".animate-spin").exists()).toBe(true);
    expect(wrapper.findAll("button")[0].element.disabled).toBe(true);
    expect(wrapper.findAll("button")[1].element.disabled).toBe(true);
  });
});

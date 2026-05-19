import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { CROP_NAMES } from "@repo/common";
import MediaItemEditor from "../../../../app/components/admin/productions/MediaItemEditor.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        media: {
          new: "NEW",
          replaced: "REPLACED",
          replace: "Replace",
          upload: "Upload",
          optional: "Optional",
          title: "Title",
          description: "Description",
          credits: "Credits",
          required: "Required",
          fallbackHint: "Fallback",
        },
      },
    },
  },
});

describe("AdminProductionsMediaItemEditor", () => {
  const defaultProps = {
    item: {
      kind: "new" as const,
      position: "main" as const,
      crops: {
        hd_ready: { type: "empty" as const },
        hd_ready_square: { type: "empty" as const },
        hd_ready_portrait: { type: "empty" as const },
        FE3_header: { type: "empty" as const },
        FE3_2by1: { type: "empty" as const },
        FE3_grid: { type: "empty" as const },
      },
      nl: { title: "NL", description: "Desc NL", credits: "Credits NL" },
      en: { title: "EN", description: "Desc EN", credits: "Credits EN" },
    },
    index: 0,
    cropNames: CROP_NAMES,
    getPreview: vi.fn(() => null),
  };

  const stubs = {
    ImagePlus: true,
    X: true,
  };

  it("renders correctly with default props", () => {
    const wrapper = mount(MediaItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("HD Ready");
    expect(wrapper.text()).toContain("Upload");
    expect(wrapper.text()).toContain("NL");
    expect(wrapper.text()).toContain("EN");
  });

  it("emits fileInput when a file is selected", async () => {
    const wrapper = mount(MediaItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const input = wrapper.find('input[type="file"]');
    await input.trigger("change");

    expect(wrapper.emitted("fileInput")).toBeTruthy();
    expect(wrapper.emitted("fileInput")?.[0][0]).toBe("hd_ready");
  });

  it("renders preview image if getPreview returns a URL", () => {
    const item = {
      ...defaultProps.item,
      crops: {
        ...defaultProps.item.crops,
        hd_ready: { type: "new" as const, file: new File([], "test.jpg") },
      },
    };
    const getPreview = vi.fn(() => "http://test.com/preview.jpg");

    const wrapper = mount(MediaItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, item, getPreview },
    });

    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("http://test.com/preview.jpg");
    expect(wrapper.text()).toContain("NEW");
  });

  it("emits removeCrop when X is clicked", async () => {
    const item = {
      ...defaultProps.item,
      crops: {
        ...defaultProps.item.crops,
        hd_ready: { type: "new" as const, file: new File([], "test.jpg") },
      },
    };

    const wrapper = mount(MediaItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { ...defaultProps, item },
    });

    const removeBtn = wrapper.find("button");
    await removeBtn.trigger("click");

    expect(wrapper.emitted("removeCrop")).toBeTruthy();
    expect(wrapper.emitted("removeCrop")?.[0][0]).toBe("hd_ready");
  });

  it("emits updateTranslation when metadata fields change", async () => {
    const wrapper = mount(MediaItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const titleInput = wrapper
      .findAll("input")
      .find((i) => i.element.value === "NL");
    await titleInput?.setValue("New NL Title");

    expect(wrapper.emitted("updateTranslation")).toBeTruthy();
    expect(wrapper.emitted("updateTranslation")?.[0]).toEqual([
      "nl",
      "title",
      "New NL Title",
    ]);
  });
});

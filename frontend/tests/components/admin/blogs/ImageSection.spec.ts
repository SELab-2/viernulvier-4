import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { ref, type Ref } from "vue";
import ImageSection from "../../../../app/components/admin/blogs/ImageSection.vue";
import * as useImageSectionModule from "../../../../app/composables/blogs/useImageSection";

vi.mock("../../../../app/composables/blogs/useImageSection", () => ({
  useImageSection: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          image: {
            multiTitle: "Images",
            multiSubtitle: "Upload images",
          },
        },
      },
    },
  },
});

interface MockReturn {
  mediaItem: Ref<unknown>;
  existingCrops: Ref<unknown>;
  loadingGallery: Ref<boolean>;
  uploadingCrop: Ref<unknown>;
  deletingCrop: Ref<unknown>;
  feedback: Ref<unknown>;
  itemTitleNl: Ref<string>;
  itemTitleEn: Ref<string>;
  itemCreditsNl: Ref<string>;
  itemCreditsEn: Ref<string>;
  savingMetadata: Ref<boolean>;
  loadGalleryAndItem: Mock;
  handleUpload: Mock;
  handleDeleteCrop: Mock;
  saveMetadata: Mock;
}

describe("AdminBlogsImageSection", () => {
  let mockReturn: MockReturn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockReturn = {
      mediaItem: ref({ id: 1 }),
      existingCrops: ref({}),
      loadingGallery: ref(false),
      uploadingCrop: ref(null),
      deletingCrop: ref(null),
      feedback: ref(null),
      itemTitleNl: ref("Titel NL"),
      itemTitleEn: ref("Title EN"),
      itemCreditsNl: ref("Credits NL"),
      itemCreditsEn: ref("Credits EN"),
      savingMetadata: ref(false),
      loadGalleryAndItem: vi.fn(),
      handleUpload: vi.fn(),
      handleDeleteCrop: vi.fn(),
      saveMetadata: vi.fn(),
    };
    (useImageSectionModule.useImageSection as Mock).mockReturnValue(mockReturn);
  });

  it("renders correctly and calls loadGalleryAndItem on mount", () => {
    const wrapper = mount(ImageSection, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: {
            template: "<div><slot /></div>",
            props: ["title", "subtitle"],
          },
          AdminBlogsImageFeedback: true,
          AdminBlogsCropGrid: true,
          AdminBlogsItemMetadata: {
            name: "AdminBlogsItemMetadata",
            template: "<div></div>",
          },
        },
      },
      props: { blogId: 123 },
    });

    expect(mockReturn.loadGalleryAndItem).toHaveBeenCalled();
    expect(
      wrapper.findComponent({ name: "AdminBlogsItemMetadata" }).exists(),
    ).toBe(true);
  });

  it("passes correct props to ItemMetadata", () => {
    const wrapper = mount(ImageSection, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: {
            template: "<div><slot /></div>",
            props: ["title", "subtitle"],
          },
          AdminBlogsImageFeedback: true,
          AdminBlogsCropGrid: true,
          AdminBlogsItemMetadata: {
            name: "AdminBlogsItemMetadata",
            template: '<div class="metadata-stub"></div>',
            props: [
              "titleNl",
              "titleEn",
              "creditsNl",
              "creditsEn",
              "disabled",
              "saving",
            ],
          },
        },
      },
      props: { blogId: 123 },
    });

    const metadata = wrapper.findComponent({ name: "AdminBlogsItemMetadata" });
    expect(metadata.exists()).toBe(true);
    expect(metadata.props("titleNl")).toBe("Titel NL");
    expect(metadata.props("disabled")).toBe(false);
  });

  it("disables ItemMetadata when mediaItem is null", () => {
    mockReturn.mediaItem.value = null;

    const wrapper = mount(ImageSection, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: {
            template: "<div><slot /></div>",
            props: ["title", "subtitle"],
          },
          AdminBlogsImageFeedback: true,
          AdminBlogsCropGrid: true,
          AdminBlogsItemMetadata: {
            name: "AdminBlogsItemMetadata",
            template: '<div class="metadata-stub"></div>',
            props: ["disabled"],
          },
        },
      },
      props: { blogId: 123 },
    });

    const metadata = wrapper.findComponent({ name: "AdminBlogsItemMetadata" });
    expect(metadata.exists()).toBe(true);
    expect(metadata.props("disabled")).toBe(true);
  });

  it("hides ItemMetadata while loading gallery", () => {
    mockReturn.loadingGallery.value = true;

    const wrapper = mount(ImageSection, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: true,
          AdminBlogsImageFeedback: true,
          AdminBlogsCropGrid: true,
          AdminBlogsItemMetadata: {
            name: "AdminBlogsItemMetadata",
            template: "<div></div>",
          },
        },
      },
      props: { blogId: 123 },
    });

    expect(
      wrapper.findComponent({ name: "AdminBlogsItemMetadata" }).exists(),
    ).toBe(false);
  });
});

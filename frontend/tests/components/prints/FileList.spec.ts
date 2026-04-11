import { describe, it, expect, beforeEach } from "vitest";
import { VueWrapper, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FileList from "../../../app/components/prints/FileList.vue";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      prints: {
        files: "Bestanden",
        noFilesCat: "Deze categorie bevat geen bestanden.",
        noFiles: "Geen bestanden beschikbaar.",
        showMore: "Meer tonen",
        remaining: "resterend",
        delete: "Verwijder",
        download: "Download",
      },
    },
    en: {
      prints: {
        files: "Files",
        noFilesCat: "This category doesn't contain any files.",
        noFiles: "No files available.",
        showMore: "Show more",
        remaining: "remaining",
        delete: "Delete",
        download: "Download",
      },
    },
  },
});

const files = [
  {
    id: 1,
    titel: "AFFICHE-1.PDF",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    url: "http://example.com/1.pdf",
  },
  {
    id: 2,
    titel: "AFFICHE-2.PDF",
    description: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 3,
    titel: "AFFICHE-3.PDF",
    description: "",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    url: "",
  },
];

describe("PrintsFileList", () => {
  let wrapper: VueWrapper<InstanceType<typeof FileList>>;

  beforeEach(() => {
    wrapper = mount(FileList, {
      global: { plugins: [i18n] },
      props: {
        category: "Affiche",
        files,
      },
    });
  });

  it("renders all file names", () => {
    const text = wrapper.text();
    expect(text).toContain("AFFICHE-1.PDF");
    expect(text).toContain("AFFICHE-2.PDF");
    expect(text).toContain("AFFICHE-3.PDF");
  });

  it("renders the category per file", () => {
    const text = wrapper.text();
    expect(text).toContain("Affiche");
  });

  it("renders the year per file", () => {
    const text = wrapper.text();
    expect(text).toContain("2025");
    expect(text).toContain("2024");
    expect(text).toContain("2023");
  });

  it("shows empty message when no files are provided", () => {
    const w: VueWrapper<InstanceType<typeof FileList>> = mount(FileList, {
      global: { plugins: [i18n] },
      props: { category: "Affiche", files: [] },
    });
    expect(w.text()).toContain("Geen bestanden beschikbaar.");
  });

  it("does not show empty message when files are provided", () => {
    expect(wrapper.text()).not.toContain("Geen bestanden beschikbaar.");
  });

  it("renders a delete button per file", () => {
    const buttons = wrapper.findAll("button");
    const filesWithImage = files.filter((f) => f.url).length;
    expect(buttons.length).toBe(files.length + filesWithImage); // download button only renders if file has image
  });
});

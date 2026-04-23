import { describe, it, expect, beforeEach } from "vitest";
import { VueWrapper, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FileGrid from "../../../app/components/prints/FileGrid.vue";
import { PrintItemView } from "@repo/common";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      prints: {
        types: {
          affiche: "Affiche",
          brochure: "Brochure",
          drukwerk: "Drukwerk",
          programma: "Programma",
        },
        title: "Drukwerk",
        headerDescription:
          "ONTDEK AFFICHES, BROCHURES EN PROGRAMMABOEKJES UIT HET VIERNULVIER ARCHIEF.",
        files: "Bestanden",
        noFilesCat: "Deze categorie bevat geen bestanden.",
        noFiles: "Geen bestanden beschikbaar.",
        showMore: "Meer tonen",
        remaining: "resterend",
        delete: "Verwijder",
        download: "Download",
        loading: "Laden...",
        retry: "Opnieuw proberen",
        noPrints: "Geen drukwerk",
        pagination: "Paginering",
        page_label: "Pagina",
        of_pages: "van {total}",
      },
    },
    en: {
      prints: {
        types: {
          affiche: "Poster",
          brochure: "Brochure",
          drukwerk: "Print",
          programma: "Program",
        },
        title: "Prints",
        headerDescription:
          "DISCOVER POSTERS, BROCHURES AND PROGRAM BOOKLETS FROM THE VIERNULVIER ARCHIVE.",
        files: "Files",
        noFilesCat: "This category doesn't contain any files.",
        noFiles: "No files available.",
        showMore: "Show more",
        remaining: "remaining",
        delete: "Delete",
        download: "Download",
        loading: "Loading...",
        retry: "Try again",
        noPrints: "No prints",
        pagination: "Pagination",
        page_label: "Page",
        of_pages: "of {total}",
      },
    },
  },
});

const baseFile = {
  description: "",
  url: "",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  print_type: "affiche" as const,
};

const files: PrintItemView[] = [];

for (let i = 0; i < 15; i++) {
  files.push({
    ...baseFile,
    id: i,
    titel: `AFFICHE-${i + 1}.PDF`,
  });
}

describe("PrintsFileGrid", () => {
  let wrapper: VueWrapper<InstanceType<typeof FileGrid>>;

  beforeEach(() => {
    wrapper = mount(FileGrid, {
      global: { plugins: [i18n] },
      props: {
        category: "Affiche",
        files,
        totalFiles: files.length,
      },
    });
  });

  it("renders the category title", () => {
    expect(wrapper.text()).toContain("Affiche");
  });

  it("renders the file count", () => {
    expect(wrapper.text()).toContain("15 Bestanden");
  });

  it("renders correct number of file items", () => {
    const items = wrapper.findAllComponents({ name: "PrintsFileGridItem" });
    expect(items.length).toBe(files.length);
  });

  it("renders file names", () => {
    const text = wrapper.text();
    expect(text).toContain("AFFICHE-1.PDF");
    expect(text).toContain("AFFICHE-2.PDF");
  });

  it("shows empty message when no files are provided", () => {
    const w: VueWrapper<InstanceType<typeof FileGrid>> = mount(FileGrid, {
      global: { plugins: [i18n] },
      props: { category: "Affiche", files: [], totalFiles: 0 },
    });
    expect(w.text()).toContain("Deze categorie bevat geen bestanden.");
  });

  it("does not show empty message when files are provided", () => {
    expect(wrapper.text()).not.toContain(
      "Deze categorie bevat geen bestanden.",
    );
  });
});

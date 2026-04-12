import { describe, it, expect, beforeEach } from "vitest";
import { VueWrapper, mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FileGrid from "../../../app/components/prints/FileGrid.vue";

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
    url: "",
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
  {
    id: 4,
    titel: "AFFICHE-4.PDF",
    description: "",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2022-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 5,
    titel: "AFFICHE-5.PDF",
    description: "",
    created_at: "2021-01-01T00:00:00Z",
    updated_at: "2021-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 6,
    titel: "AFFICHE-6.PDF",
    description: "",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 7,
    titel: "AFFICHE-7.PDF",
    description: "",
    created_at: "2019-01-01T00:00:00Z",
    updated_at: "2019-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 8,
    titel: "AFFICHE-8.PDF",
    description: "",
    created_at: "2018-01-01T00:00:00Z",
    updated_at: "2018-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 9,
    titel: "AFFICHE-9.PDF",
    description: "",
    created_at: "2017-01-01T00:00:00Z",
    updated_at: "2017-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 10,
    titel: "AFFICHE-10.PDF",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 11,
    titel: "AFFICHE-11.PDF",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 12,
    titel: "AFFICHE-12.PDF",
    description: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 13,
    titel: "AFFICHE-13.PDF",
    description: "",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 14,
    titel: "AFFICHE-14.PDF",
    description: "",
    created_at: "2022-01-01T00:00:00Z",
    updated_at: "2022-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 15,
    titel: "AFFICHE-15.PDF",
    description: "",
    created_at: "2021-01-01T00:00:00Z",
    updated_at: "2021-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 16,
    titel: "AFFICHE-16.PDF",
    description: "",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2020-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 17,
    titel: "AFFICHE-17.PDF",
    description: "",
    created_at: "2019-01-01T00:00:00Z",
    updated_at: "2019-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 18,
    titel: "AFFICHE-18.PDF",
    description: "",
    created_at: "2018-01-01T00:00:00Z",
    updated_at: "2018-01-01T00:00:00Z",
    url: "",
  },
  {
    id: 19,
    titel: "AFFICHE-19.PDF",
    description: "",
    created_at: "2017-01-01T00:00:00Z",
    updated_at: "2017-01-01T00:00:00Z",
    url: "",
  },
];

describe("PrintsFileGrid", () => {
  let wrapper: VueWrapper<InstanceType<typeof FileGrid>>;

  beforeEach(() => {
    wrapper = mount(FileGrid, {
      global: { plugins: [i18n] },
      props: {
        category: "Affiche",
        files,
      },
    });
  });

  it("renders the category title", () => {
    expect(wrapper.text()).toContain("Affiche");
  });

  it("renders the file count", () => {
    expect(wrapper.text()).toContain(files.length.toString());
  });

  it("renders file names on first page", () => {
    const text = wrapper.text();
    expect(text).toContain("AFFICHE-1.PDF");
    expect(text).toContain("AFFICHE-2.PDF");
    expect(text).not.toContain("AFFICHE-18.PDF");
    expect(text).not.toContain("AFFICHE-19.PDF");
  });

  it("shows pagination when files exceed one page", () => {
    expect(wrapper.text()).toContain("1 /");
  });

  it("navigates to next page when next button is clicked", async () => {
    expect(wrapper.text()).toContain("AFFICHE-1.PDF");
    expect(wrapper.text()).not.toContain("AFFICHE-19.PDF");

    const buttons = wrapper.findAll("button");
    const nextButton = buttons[buttons.length - 1]; // last button is next page
    await nextButton.trigger("click");

    expect(wrapper.text()).toContain("AFFICHE-17.PDF");
    expect(wrapper.text()).not.toContain("AFFICHE-1.PDF");
  });

  it("shows empty message when no files are provided", () => {
    const w: VueWrapper<InstanceType<typeof FileGrid>> = mount(FileGrid, {
      global: { plugins: [i18n] },
      props: { category: "Affiche", files: [] },
    });
    expect(w.text()).toContain("Deze categorie bevat geen bestanden.");
  });

  it("does not show empty message when files are provided", () => {
    expect(wrapper.text()).not.toContain(
      "Deze categorie bevat geen bestanden.",
    );
  });
});

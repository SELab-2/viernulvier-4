import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import CsvTemplateDownload from "../../../app/components/admin/CsvTemplateDownload.vue";

const i18n = createI18n({
  legacy: false,
  locale: "nl",
  messages: {
    nl: {
      admin: {
        parser: {
          targets: {
            productions: "producties",
            events: "evenementen",
            tags: "tags",
            blogs: "verhalen",
            prices: "prijzen",
          },
        },
      },
      csv: {
        templates: {
          productions: {
            description:
              "Gebruik dit bestand om producties aan te maken. Bevat velden voor ID, NL/EN titels en beschrijvingen, optionele artiest- en tagline-velden, credits en metadata.",
          },
          events: {
            description:
              "Gebruik dit bestand om evenementen toe te voegen. Bevat start-/eindtijden, optionele deur- en pauzetijden, locatievelden en verwijzing naar producties via legacy ID.",
          },
          tags: {
            description:
              "Gebruik dit bestand om tags aan te maken en aan producties te koppelen. Bevat Nederlandse en Engelse tag-namen en een komma-gescheiden lijst met productie-IDs.",
          },
          blogs: {
            description:
              "Gebruik dit bestand voor blogs (verhalen). Bevat NL/EN titels en omschrijvingen en koppeling naar een productie via legacy ID.",
          },
          prices: {
            description:
              "Gebruik dit bestand voor prijsinformatie. Bevat NL/EN prijsnaam, numerieke prijs en koppeling naar een evenement via legacy ID.",
          },
          labels: {
            mandatory: "Verplicht",
            nullable: "Optioneel",
            example: "Voorbeeld",
          },
          general: {
            header: "Enkele disclaimers:",
            autoFill:
              "Als één van de taalvelden is ingevuld, wordt het andere automatisch ingevuld.",
            disclaimer:
              "Gebruik altijd de ID's uit vorige CSV-bestanden om nieuwe objecten te koppelen.",
            uniqueIds:
              "Zorg dat IDs uniek zijn voor evenementen en producties.",
          },
        },
      },
    },
    en: {
      admin: {
        parser: {
          targets: {
            productions: "productions",
            events: "events",
            tags: "tags",
            blogs: "stories",
            prices: "prices",
          },
        },
      },
      csv: {
        templates: {
          productions: {
            description:
              "Use this file to create productions. Contains fields for ID, NL/EN titles and descriptions, optional artist and tagline fields, credits and metadata.",
          },
          events: {
            description:
              "Use this file to add events. Contains start/end times, optional doors/intermission times, location fields and a reference to productions via legacy ID.",
          },
          tags: {
            description:
              "Use this file to create tags and attach them to productions. Contains Dutch and English tag names and a comma-separated list of production IDs.",
          },
          blogs: {
            description:
              "Use this file for blogs (stories). Contains NL/EN titles and descriptions and a link to a production via legacy ID.",
          },
          prices: {
            description:
              "Use this file for price information. Contains NL/EN price name, numeric price and a link to an event via legacy ID.",
          },
          labels: {
            mandatory: "Mandatory",
            nullable: "Optional",
            example: "Example",
          },
          general: {
            header: "A few disclaimers:",
            autoFill:
              "If either language field is filled in, the other will be filled automatically.",
            disclaimer:
              "Always use the IDs from previous CSV files to link to new objects.",
            uniqueIds: "Ensure IDs are unique for events and productions.",
          },
        },
      },
    },
  },
});

describe("CsvTemplateDownload", () => {
  it("renders productions template with correct title", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "productions",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Download producties template");
  });

  it("renders events template with correct title", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "events",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Download evenementen template");
  });

  it("displays mandatory fields for productions", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "productions",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("ID");
    expect(wrapper.text()).toContain("Titel_NL");
    expect(wrapper.text()).toContain("Description1_NL");
  });

  it("displays optional fields for productions", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "productions",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Titel_EN");
    expect(wrapper.text()).toContain("Artist_NL");
    expect(wrapper.text()).toContain("Performer_Type");
  });

  it("displays production example", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "productions",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("De Grote Show");
    expect(wrapper.text()).toContain("Circus de Zon");
  });

  it("displays event example", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "events",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("2024-07-01");
    expect(wrapper.text()).toContain("Amsterdam Arena");
  });

  it("displays prices example", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "prices",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Prijs 1");
    expect(wrapper.text()).toContain("Price 1");
  });

  it("passes correct props to download button", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "productions",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    const downloadButton = wrapper.findComponent({
      name: "AdminDownloadButton",
    });
    expect(downloadButton.props("label")).toBe("Download producties template");
    expect(downloadButton.props("name")).toBe("productions_template.csv");
    expect(downloadButton.props("src")).toBe(
      "/csv_templates/productions_template.csv",
    );
  });

  it("displays localized labels", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "tags",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Verplicht");
    expect(wrapper.text()).toContain("Optioneel");
    expect(wrapper.text()).toContain("Voorbeeld");
  });

  it("displays template description", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "tags",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain(
      "Gebruik dit bestand om tags aan te maken",
    );
  });

  it("displays blogs example", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "blogs",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Blogpost 1 NL");
    expect(wrapper.text()).toContain("Nederlandse beschrijving");
  });

  it("displays tags example", () => {
    const wrapper = mount(CsvTemplateDownload, {
      props: {
        target: "tags",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminDownloadButton: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Tag1_NL");
    expect(wrapper.text()).toContain("Tag1_EN");
  });
});

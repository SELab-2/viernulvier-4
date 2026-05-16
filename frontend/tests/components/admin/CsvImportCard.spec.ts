import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";
import CsvImportCard from "../../../app/components/admin/CsvImportCard.vue";

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
        csvImport: {
          title: "CSV import tools voor {target}",
          description: "Tijdelijke plaatsing op de aanmaakpagina van {target}.",
        },
      },
    },
  },
});

const TemplateStub = defineComponent({
  name: "AdminCsvTemplateDownload",
  props: {
    target: {
      type: String,
      required: true,
    },
  },
  template: '<div data-test="template">template: {{ target }}</div>',
});

const UploadStub = defineComponent({
  name: "AdminCsvUploadComponent",
  props: {
    target: {
      type: String,
      required: true,
    },
  },
  template: '<div data-test="upload">upload: {{ target }}</div>',
});

describe("CsvImportCard", () => {
  it("renders localized title and description with target label", () => {
    const wrapper = mount(CsvImportCard, {
      props: {
        target: "blogs",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminCsvTemplateDownload: TemplateStub,
          AdminCsvUploadComponent: UploadStub,
        },
      },
    });

    expect(wrapper.text()).toContain("CSV import tools voor verhalen");
    expect(wrapper.text()).toContain(
      "Tijdelijke plaatsing op de aanmaakpagina van verhalen.",
    );
  });

  it("renders a red disclaimer when provided", () => {
    const wrapper = mount(CsvImportCard, {
      props: {
        target: "events",
        disclaimer: "Dit is een tijdelijke testwaarschuwing.",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminCsvTemplateDownload: TemplateStub,
          AdminCsvUploadComponent: UploadStub,
        },
      },
    });

    const disclaimer = wrapper.find("p.text-red-600");

    expect(disclaimer.exists()).toBe(true);
    expect(disclaimer.text()).toBe("Dit is een tijdelijke testwaarschuwing.");
  });

  it("passes target through to template and upload children", () => {
    const wrapper = mount(CsvImportCard, {
      props: {
        target: "prices",
      },
      global: {
        plugins: [i18n],
        stubs: {
          AdminCsvTemplateDownload: TemplateStub,
          AdminCsvUploadComponent: UploadStub,
        },
      },
    });

    expect(wrapper.find('[data-test="template"]').text()).toContain(
      "template: prices",
    );
    expect(wrapper.find('[data-test="upload"]').text()).toContain(
      "upload: prices",
    );
  });
});

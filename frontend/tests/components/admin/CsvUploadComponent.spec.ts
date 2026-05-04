import { mount } from "@vue/test-utils";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createI18n } from "vue-i18n";
import CsvUploadComponent from "../../../app/components/admin/CsvUploadComponent.vue";

const mockUploadCsv = vi.fn();
const mockSnackbarAdd = vi.fn();

// Mock the composables and libraries
vi.mock("vue3-snackbar", () => {
  return {
    useSnackbar: () => ({
      add: mockSnackbarAdd,
    }),
  };
});

vi.mock("~/composables/useParserApi", () => ({
  useParserApi: () => ({
    uploadCsv: mockUploadCsv,
  }),
}));

const i18n = createI18n({
  legacy: false,
  locale: "nl",
  messages: {
    nl: {
      admin: {
        parser: {
          title: "CSV parser",
          description: "Upload een CSV-bestand om te importeren.",
          uploadCsv: "Upload {target} CSV",
          uploading: "Uploaden...",
          uploadSuccess: "{target} CSV succesvol geüpload.",
          uploadError: "{target} CSV kon niet worden geüpload.",
          headerError: "{target} CSV mist verplichte kolommen: {fields}.",
          headerFallbackFields: "onbekende kolommen",
          targets: {
            productions: "producties",
            events: "evenementen",
            tags: "tags",
            blogs: "verhalen",
            prices: "prijzen",
          },
        },
      },
    },
    en: {
      admin: {
        parser: {
          title: "CSV parser",
          description: "Upload a CSV file to import it.",
          uploadCsv: "Upload {target} CSV",
          uploading: "Uploading...",
          uploadSuccess: "Successfully uploaded {target} CSV.",
          uploadError: "Could not upload {target} CSV.",
          headerError: "{target} CSV is missing required headers: {fields}.",
          headerFallbackFields: "unknown headers",
          targets: {
            productions: "productions",
            events: "events",
            tags: "tags",
            blogs: "stories",
            prices: "prices",
          },
        },
      },
    },
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CsvUploadComponent", () => {
  it("shows a localized snackbar when headers are missing", async () => {
    mockUploadCsv.mockResolvedValueOnce({
      data: null,
      error: "CSV file is missing required headers.",
      errorCode: "CSV_MISSING_HEADERS",
      errorData: { missingHeaders: ["Title", "Date"] },
      status: 400,
    });

    const wrapper = mount(CsvUploadComponent, {
      global: {
        plugins: [i18n],
      },
      props: {
        target: "productions",
      },
    });

    const file = new File(["name\nexample"], "productions.csv", {
      type: "text/csv",
    });

    const fileInput = wrapper.find('input[type="file"]');
    const inputElement = fileInput.element as HTMLInputElement;

    // Create a FileList-like object
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputElement.files = dataTransfer.files;

    await fileInput.trigger("change");

    expect(mockUploadCsv).toHaveBeenCalledOnce();
    expect(mockUploadCsv).toHaveBeenCalledWith("productions", file);
    expect(mockSnackbarAdd).toHaveBeenCalledWith({
      type: "error",
      text: "producties CSV mist verplichte kolommen: Title, Date.",
    });
  });

  it("renders the upload button with the selected target label", () => {
    const wrapper = mount(CsvUploadComponent, {
      global: {
        plugins: [i18n],
      },
      props: {
        target: "events",
      },
    });

    expect(wrapper.text()).toContain("evenementen");
    expect(wrapper.text()).toContain("Upload evenementen CSV");
  });
});

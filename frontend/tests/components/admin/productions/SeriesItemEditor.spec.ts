import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type {
  NewSeries,
  ExistingSeries,
} from "~/composables/productions/steps/productionSeries";
import SeriesItemEditor from "../../../../app/components/admin/productions/SeriesItemEditor.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        "form-title": "Title",
        "form-description": "Description",
      },
    },
  },
});

describe("AdminProductionsSeriesItemEditor", () => {
  const defaultProps = {
    item: {
      type: "new" as const,
      titel: { nl: "NL Title", en: "EN Title" },
      description: { nl: "NL Desc", en: "EN Desc" },
    },
  };

  it("renders correctly with provided item", () => {
    const wrapper = mount(SeriesItemEditor, {
      global: {
        plugins: [i18n],
      },
      props: defaultProps,
    });

    const inputs = wrapper.findAll("input");
    expect(inputs[0].element.value).toBe("NL Title");
    expect(inputs[1].element.value).toBe("EN Title");

    const textareas = wrapper.findAll("textarea");
    expect(textareas[0].element.value).toBe("NL Desc");
    expect(textareas[1].element.value).toBe("EN Desc");
  });

  it("emits update when title changes", async () => {
    const wrapper = mount(SeriesItemEditor, {
      global: {
        plugins: [i18n],
      },
      props: defaultProps,
    });

    const input = wrapper.findAll("input")[0];
    await input.setValue("New NL Title");

    expect(wrapper.emitted("update")).toBeTruthy();
    const emitted = wrapper.emitted("update")?.[0][0] as NewSeries;
    expect(emitted.titel.nl).toBe("New NL Title");
    expect(emitted.type).toBe("new");
  });

  it("emits update for existing item correctly", async () => {
    const item = {
      type: "existing" as const,
      id: 123,
      titel: { nl: "Ex Title", en: null },
      description: { nl: "Ex Desc", en: undefined },
    };

    const wrapper = mount(SeriesItemEditor, {
      global: {
        plugins: [i18n],
      },
      props: { item },
    });

    const input = wrapper.findAll("input")[1]; // EN Title
    await input.setValue("New EN Title");

    expect(wrapper.emitted("update")).toBeTruthy();
    const emitted = wrapper.emitted("update")?.[0][0] as ExistingSeries;
    expect(emitted.titel.en).toBe("New EN Title");
    expect(emitted.id).toBe(123);
    expect(emitted.type).toBe("existing");
  });
});

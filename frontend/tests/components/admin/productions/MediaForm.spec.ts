import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { ProductionMediaForm } from "~/composables/productions/steps/productionMedia";
import MediaForm from "../../../../app/components/admin/productions/MediaForm.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        media: {
          main: "Main Image",
          mainHint: "Hint",
          add: "Add",
          noMain: "No main image",
          carousel: "Carousel Images",
          carouselHint: "Hint",
          noCarousel: "No carousel images",
          carouselItem: "Item",
          prints: "Prints",
          printsHint: "Hint",
        },
      },
    },
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:test");

describe("AdminProductionsMediaForm", () => {
  const defaultProps = {
    modelValue: {
      items: [],
      prints: [],
    } as ProductionMediaForm,
  };

  const stubs = {
    AdminProductionsMediaItemEditor: {
      name: "AdminProductionsMediaItemEditor",
      template: '<div class="item-editor-stub"></div>',
      props: ["item", "index", "cropNames", "getPreview"],
    },
    AdminProductionsPrintSelector: {
      name: "AdminProductionsPrintSelector",
      template: '<div class="print-selector-stub"></div>',
      props: ["modelValue"],
    },
    Trash2: true,
    Plus: true,
    ChevronDown: true,
    ChevronUp: true,
    ImagePlus: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state correctly", () => {
    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("No main image");
    expect(wrapper.text()).toContain("No carousel images");
  });

  it("emits update:modelValue when adding a main item", async () => {
    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const addBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Add"));
    await addBtn?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    expect(emitted.items).toHaveLength(1);
    expect(emitted.items[0].position).toBe("main");
  });

  it("renders main item editor when main item exists", () => {
    const modelValue: ProductionMediaForm = {
      items: [
        {
          kind: "new" as const,
          position: "main" as const,
          crops: {
            hd_ready: { type: "empty" },
            hd_ready_square: { type: "empty" },
            hd_ready_portrait: { type: "empty" },
            FE3_header: { type: "empty" },
            FE3_2by1: { type: "empty" },
            FE3_grid: { type: "empty" },
          },
          nl: { title: "", description: "", credits: "" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      prints: [],
    };

    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    expect(
      wrapper
        .findComponent({ name: "AdminProductionsMediaItemEditor" })
        .exists(),
    ).toBe(true);
    expect(wrapper.text()).not.toContain("No main image");
  });

  it("handles deleting an item", async () => {
    const modelValue: ProductionMediaForm = {
      items: [
        {
          kind: "new" as const,
          position: "main" as const,
          crops: {
            hd_ready: { type: "empty" },
            hd_ready_square: { type: "empty" },
            hd_ready_portrait: { type: "empty" },
            FE3_header: { type: "empty" },
            FE3_2by1: { type: "empty" },
            FE3_grid: { type: "empty" },
          },
          nl: { title: "Main", description: "", credits: "" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      prints: [],
    };

    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    const deleteBtn = wrapper.find(
      'button[class*="hover:text-action-red-icon"]',
    );
    await deleteBtn.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    expect(emitted.items).toHaveLength(0);
  });

  it("handles file input for a crop", () => {
    const modelValue: ProductionMediaForm = {
      items: [
        {
          kind: "new" as const,
          position: "main" as const,
          crops: {
            hd_ready: { type: "empty" },
            hd_ready_square: { type: "empty" },
            hd_ready_portrait: { type: "empty" },
            FE3_header: { type: "empty" },
            FE3_2by1: { type: "empty" },
            FE3_grid: { type: "empty" },
          },
          nl: { title: "", description: "", credits: "" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      prints: [],
    };

    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs: {
          ...stubs,
          AdminProductionsMediaItemEditor: {
            name: "AdminProductionsMediaItemEditor",
            template: '<div class="stub"></div>',
          },
        },
      },
      props: { modelValue },
    });

    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    const mockEvent = { target: { files: [file] } } as unknown as Event;

    const itemEditor = wrapper.findComponent({
      name: "AdminProductionsMediaItemEditor",
    });
    (
      itemEditor.vm as unknown as { $emit: (e: string, ...args: any[]) => void }
    ).$emit("file-input", "hd_ready", mockEvent);

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    const firstItem = emitted.items[0];
    if ("crops" in firstItem) {
      expect(firstItem.crops.hd_ready.type).toBe("new");
    }
  });

  it("handles removing a crop", () => {
    const modelValue: ProductionMediaForm = {
      items: [
        {
          kind: "new" as const,
          position: "main" as const,
          crops: {
            hd_ready: { type: "new", file: new File([], "test.jpg") },
            hd_ready_square: { type: "empty" },
            hd_ready_portrait: { type: "empty" },
            FE3_header: { type: "empty" },
            FE3_2by1: { type: "empty" },
            FE3_grid: { type: "empty" },
          },
          nl: { title: "", description: "", credits: "" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      prints: [],
    };

    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs: {
          ...stubs,
          AdminProductionsMediaItemEditor: {
            name: "AdminProductionsMediaItemEditor",
            template: '<div class="stub"></div>',
          },
        },
      },
      props: { modelValue },
    });

    const itemEditor = wrapper.findComponent({
      name: "AdminProductionsMediaItemEditor",
    });
    (
      itemEditor.vm as unknown as { $emit: (e: string, ...args: any[]) => void }
    ).$emit("remove-crop", "hd_ready");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    const firstItem = emitted.items[0];
    if ("crops" in firstItem) {
      expect(firstItem.crops.hd_ready.type).toBe("empty");
    }
  });

  it("handles updating translation fields", () => {
    const modelValue: ProductionMediaForm = {
      items: [
        {
          kind: "new" as const,
          position: "main" as const,
          crops: {
            hd_ready: { type: "empty" },
            hd_ready_square: { type: "empty" },
            hd_ready_portrait: { type: "empty" },
            FE3_header: { type: "empty" },
            FE3_2by1: { type: "empty" },
            FE3_grid: { type: "empty" },
          },
          nl: { title: "", description: "", credits: "" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      prints: [],
    };

    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs: {
          ...stubs,
          AdminProductionsMediaItemEditor: {
            name: "AdminProductionsMediaItemEditor",
            template: '<div class="stub"></div>',
          },
        },
      },
      props: { modelValue },
    });

    const itemEditor = wrapper.findComponent({
      name: "AdminProductionsMediaItemEditor",
    });
    (
      itemEditor.vm as unknown as { $emit: (e: string, ...args: any[]) => void }
    ).$emit("update-translation", "nl", "title", "New Title");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    const firstItem = emitted.items[0];
    if ("nl" in firstItem) {
      expect(firstItem.nl.title).toBe("New Title");
    }
  });

  it("handles adding carousel items", async () => {
    const wrapper = mount(MediaForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const buttons = wrapper.findAll("button");
    const carouselBtn = buttons.find((b) => {
      const text = b.text().toLowerCase();
      const parentText =
        b.element.parentElement?.textContent?.toLowerCase() || "";
      return text.includes("add") && parentText.includes("carousel");
    });

    await carouselBtn?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionMediaForm;
    expect(emitted.items[0].position).toBe("carousel");
  });
});

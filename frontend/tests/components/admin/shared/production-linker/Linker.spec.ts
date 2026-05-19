import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { ProductionView } from "@repo/common";
import Linker from "../../../../../app/components/admin/shared/production-linker/Linker.vue";
import * as useProductionApiModule from "../../../../../app/composables/useProductionApi";

vi.mock("../../../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        shared: {
          productionLinker: {
            title: "Linked Productions",
          },
        },
      },
    },
  },
});

describe("AdminSharedProductionLinker", () => {
  const mockProductionApi = {
    getAll: vi.fn(),
    linkBlog: vi.fn(),
    unlinkBlog: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(
      mockProductionApi,
    );
    localStorage.clear();
  });

  it("shows locked hint if entityId is not provided", () => {
    const wrapper = mount(Linker, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: { template: "<div><slot /></div>" },
          AdminSharedProductionLinkerLockedHint: {
            template: '<div class="locked-hint">Locked</div>',
          },
        },
      },
      props: { entityId: null, type: "blog" },
    });

    expect(wrapper.find(".locked-hint").exists()).toBe(true);
  });

  it("shows search dropdown and list if entityId is provided", () => {
    const wrapper = mount(Linker, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: { template: "<div><slot /></div>" },
          AdminSharedProductionLinkerSearchDropdown: {
            template: '<div class="search-dropdown"></div>',
          },
          AdminSharedProductionLinkerLinkedList: {
            template: '<div class="linked-list"></div>',
          },
        },
      },
      props: { entityId: 123, type: "blog" },
    });

    expect(wrapper.find(".search-dropdown").exists()).toBe(true);
    expect(wrapper.find(".linked-list").exists()).toBe(true);
  });

  it("restores linked productions from localStorage on mount", async () => {
    const stored = [{ id: 1, titel: "Prod 1" }];
    localStorage.setItem("vnv-blog-linked-prods-123", JSON.stringify(stored));

    const wrapper = mount(Linker, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: { template: "<div><slot /></div>" },
          AdminSharedProductionLinkerSearchDropdown: true,
          AdminSharedProductionLinkerLinkedList: {
            template:
              '<div class="linked-list"><div v-for="p in productions" :key="p.id" class="item">{{ p.titel }}</div></div>',
            props: ["productions"],
          },
        },
      },
      props: { entityId: 123, type: "blog" },
    });

    await flushPromises();
    expect(wrapper.findAll(".item").length).toBe(1);
    expect(wrapper.text()).toContain("Prod 1");
  });

  it("calls linkBlog API and updates list when handleLink is called", async () => {
    const wrapper = mount(Linker, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: { template: "<div><slot /></div>" },
          AdminSharedProductionLinkerSearchDropdown: {
            template:
              "<button @click=\"$emit('link', { id: 1, titel: 'New Prod' })\">Link</button>",
            name: "AdminSharedProductionLinkerSearchDropdown",
          },
          AdminSharedProductionLinkerLinkedList: true,
        },
      },
      props: { entityId: 123, type: "blog" },
    });

    (mockProductionApi.linkBlog as Mock).mockResolvedValue({ data: {} });

    await wrapper.find("button").trigger("click");

    expect(mockProductionApi.linkBlog).toHaveBeenCalledWith(1, 123);
    await flushPromises();

    const saved = JSON.parse(
      localStorage.getItem("vnv-blog-linked-prods-123") || "[]",
    ) as ProductionView[];
    expect(saved[0].titel).toBe("New Prod");
  });

  it("calls unlinkBlog API and updates list when handleUnlink is called", async () => {
    const stored = [{ id: 1, titel: "Prod 1" }];
    localStorage.setItem("vnv-blog-linked-prods-123", JSON.stringify(stored));

    const wrapper = mount(Linker, {
      global: {
        plugins: [i18n],
        stubs: {
          FormSectionsSectionCard: { template: "<div><slot /></div>" },
          AdminSharedProductionLinkerSearchDropdown: true,
          AdminSharedProductionLinkerLinkedList: {
            template: "<button @click=\"$emit('unlink', 1)\">Unlink</button>",
            name: "AdminSharedProductionLinkerLinkedList",
          },
        },
      },
      props: { entityId: 123, type: "blog" },
    });

    await flushPromises();
    (mockProductionApi.unlinkBlog as Mock).mockResolvedValue({ data: {} });

    await wrapper.find("button").trigger("click");

    expect(mockProductionApi.unlinkBlog).toHaveBeenCalledWith(1, 123);
    await flushPromises();

    const saved = JSON.parse(
      localStorage.getItem("vnv-blog-linked-prods-123") || "[]",
    ) as ProductionView[];
    expect(saved.length).toBe(0);
  });
});

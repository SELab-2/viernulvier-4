import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import ProductionGridViewItem from "../../app/components/ProductionGridViewItem.vue";
import ProductionListViewItem from "../../app/components/ProductionListViewItem.vue";

const locale = ref<"en" | "nl">("en");
const getTags = vi.fn();
const getMediaGallery = vi.fn();
const getAllEvents = vi.fn();
const getMainImageCrop = vi.fn();

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ locale }),
}));

vi.mock("~/composables/useProductionApi", () => ({
  useProductionApi: () => ({ getTags, getMediaGallery }),
}));

vi.mock("~/composables/useEventApi", () => ({
  useEventApi: () => ({ getAll: getAllEvents }),
}));

vi.mock("~/composables/media/useGallery", () => ({
  useGallery: () => ({ getMainImageCrop }),
}));

const production = {
  id: 42,
  titel: "Macbeth",
  artist: "William Shakespeare",
};

const gallery = {
  id: 9,
  items: [{ id: 1 }],
};

const globalStubs = {
  NuxtLink: { props: ["to"], template: '<a :href="to"><slot /></a>' },
  MediaDisplay: {
    props: ["id", "src", "showIcon", "size"],
    template: '<div data-test="media-display">{{ id }}:{{ src?.url }}</div>',
  },
  TagPill: {
    props: ["label"],
    template: '<span class="tag-pill">{{ label }}</span>',
  },
};

describe("production item components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locale.value = "en";
    getTags.mockResolvedValue({
      data: [
        { id: 1, tag: "Drama" },
        { id: 2, tag: "N/A" },
        { id: 3, tag: { en: "Classic", nl: "Klassiek" } },
      ],
    });
    getAllEvents.mockResolvedValue({
      data: {
        objects: [
          {
            id: 1,
            starttime: "2020-01-02T20:00:00.000Z",
            endtime: "2020-01-03T22:00:00.000Z",
          },
        ],
      },
    });
    getMediaGallery.mockResolvedValue(gallery);
    getMainImageCrop.mockReturnValue({ url: "/macbeth.jpg" });
  });

  it("loads grid item tags, events, gallery, and links to the detail page", async () => {
    const wrapper = mount(ProductionGridViewItem, {
      props: { productionView: production },
      global: { stubs: globalStubs },
    });

    await flushPromises();

    expect(getTags).toHaveBeenCalledWith(42, "en");
    expect(getAllEvents).toHaveBeenCalledWith({
      eventFilters: { production_id: 42 },
    });
    expect(getMediaGallery).toHaveBeenCalledWith(42, "en");
    expect(getMainImageCrop).toHaveBeenCalledWith(gallery, "hd_ready");
    expect(wrapper.find("a").attributes("href")).toBe("/productions/42");
    expect(wrapper.text()).toContain("Macbeth");
    expect(wrapper.text()).toContain("William Shakespeare");
    expect(wrapper.text()).toContain("Drama");
    expect(wrapper.text()).not.toContain("N/A");
  });

  it("reloads grid item data when the production id or locale changes", async () => {
    const wrapper = mount(ProductionGridViewItem, {
      props: { productionView: production },
      global: { stubs: globalStubs },
    });
    await flushPromises();
    getTags.mockClear();
    getAllEvents.mockClear();
    getMediaGallery.mockClear();

    await wrapper.setProps({
      productionView: { ...production, id: 43, titel: "Othello" },
    });
    await flushPromises();

    expect(getTags).toHaveBeenCalledWith(43, "en");
    expect(getAllEvents).toHaveBeenCalledWith({
      eventFilters: { production_id: 43 },
    });
    expect(getMediaGallery).toHaveBeenCalledWith(43, "en");

    getTags.mockClear();
    locale.value = "nl";
    await nextTick();
    await flushPromises();

    expect(getTags).toHaveBeenCalledWith(43, "nl");
  });

  it("renders list item public mode as a link with loaded card props", async () => {
    const wrapper = mount(ProductionListViewItem, {
      props: { productionView: production },
      global: {
        stubs: {
          NuxtLink: globalStubs.NuxtLink,
          ProductionListViewItemCard: {
            props: [
              "productionView",
              "isAdmin",
              "mainCrop",
              "dateRangeText",
              "tags",
              "isFutureProduction",
            ],
            template:
              '<div data-test="card">{{ productionView.titel }} {{ mainCrop?.url }} {{ tags.length }} {{ isFutureProduction }}</div>',
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.find("a").attributes("href")).toBe("/productions/42");
    expect(wrapper.find('[data-test="card"]').text()).toContain("Macbeth");
    expect(wrapper.find('[data-test="card"]').text()).toContain("/macbeth.jpg");
    expect(wrapper.find('[data-test="card"]').text()).toContain("2");
  });

  it("renders admin list item and forwards delete events with gallery", async () => {
    getAllEvents.mockResolvedValue({
      data: {
        objects: [
          {
            id: 1,
            starttime: "2999-01-01T20:00:00.000Z",
            endtime: "2999-01-01T22:00:00.000Z",
          },
        ],
      },
    });
    const wrapper = mount(ProductionListViewItem, {
      props: { productionView: production, isAdmin: true },
      global: {
        stubs: {
          ProductionListViewItemCard: {
            props: [
              "productionView",
              "isAdmin",
              "mainCrop",
              "dateRangeText",
              "tags",
              "isFutureProduction",
            ],
            emits: ["delete"],
            template: `<button data-test="delete" @click="$emit('delete', productionView)">{{ isAdmin }} {{ isFutureProduction }}</button>`,
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find('[data-test="delete"]').text()).toContain("true true");

    await wrapper.find('[data-test="delete"]').trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual([production, gallery]);
  });
});

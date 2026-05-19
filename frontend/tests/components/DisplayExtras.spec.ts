import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import ProductionListViewItemCard from "../../app/components/ProductionListViewItemCard.vue";
import ProductionGallery from "../../app/components/production/ProductionGallery.vue";
import YearPicker from "../../app/components/YearPicker.vue";

mockNuxtImport("useI18n", () => () => ({
  t: (key: string, params?: { slide?: number }) =>
    params?.slide ? `${key}:${params.slide}` : key,
}));

const production = {
  id: 12,
  titel: "King Lear",
  artist: "Company A",
};

const crop = { url: "/lear.jpg" };
const tags = [
  { id: 1, tag: "Theatre" },
  { id: 2, tag: "Archive" },
];

const cardStubs = {
  MediaDisplay: {
    props: ["id", "src", "size", "rounded", "showIcon"],
    template: '<div data-test="media">{{ id }} {{ src?.url }} {{ size }}</div>',
  },
  TagPill: {
    props: ["label"],
    template: '<span class="tag-pill">{{ label }}</span>',
  },
  NuxtLink: { props: ["to"], template: '<a :href="to"><slot /></a>' },
  AdminWarningButton: {
    props: ["title", "description"],
    template: '<div data-test="warning">{{ title }} {{ description }}</div>',
  },
  AdminEditButton: {
    props: ["label"],
    template: "<button>{{ label }}</button>",
  },
  AdminDeleteButton: {
    props: ["label"],
    template: `<button @click="$emit('click')">{{ label }}</button>`,
  },
};

describe("display helper components", () => {
  it("renders production card content and public metadata", () => {
    const wrapper = mount(ProductionListViewItemCard, {
      props: {
        productionView: production,
        mainCrop: crop,
        dateRangeText: "2020 - 2021",
        tags,
        isFutureProduction: false,
      },
      global: { stubs: cardStubs },
    });

    expect(wrapper.text()).toContain("King Lear");
    expect(wrapper.text()).toContain("Company A");
    expect(wrapper.text()).toContain("2020 - 2021");
    expect(wrapper.text()).toContain("Theatre");
    expect(wrapper.find('[data-test="media"]').text()).toContain("/lear.jpg");
  });

  it("emits delete from the admin production card when it is not a future production", async () => {
    const wrapper = mount(ProductionListViewItemCard, {
      props: {
        productionView: production,
        isAdmin: true,
        mainCrop: crop,
        dateRangeText: "2020",
        tags: [],
        isFutureProduction: false,
      },
      global: { stubs: cardStubs },
    });

    expect(wrapper.find('a[href="/admin/productions/edit/12"]').exists()).toBe(
      true,
    );
    expect(wrapper.text()).toContain("Edit production");
    expect(wrapper.findAll(".tag-pill")).toHaveLength(1);

    await wrapper.findAll("button").at(-1)?.trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual([production]);
  });

  it("shows an admin warning instead of edit/delete actions for future productions", () => {
    const wrapper = mount(ProductionListViewItemCard, {
      props: {
        productionView: production,
        isAdmin: true,
        mainCrop: null,
        dateRangeText: "2999",
        tags,
        isFutureProduction: true,
      },
      global: { stubs: cardStubs },
    });

    expect(wrapper.find('[data-test="warning"]').text()).toContain(
      "admin-productions.warning-title",
    );
    expect(wrapper.text()).not.toContain("Edit production");
    expect(wrapper.text()).not.toContain("Delete production");
  });

  it("navigates production gallery slides and wraps at the edges", async () => {
    const wrapper = mount(ProductionGallery, {
      props: {
        productionId: 12,
        images: [
          { url: "/one.jpg" },
          { url: "/two.jpg" },
          { url: "/three.jpg" },
        ],
      },
      global: {
        stubs: {
          MediaDisplay: {
            props: ["id", "src", "size", "rounded"],
            template: '<div data-test="gallery-media">{{ src?.url }}</div>',
          },
          ChevronLeft: true,
          ChevronRight: true,
        },
      },
    });

    const buttons = wrapper.findAll("button");
    expect(wrapper.text()).toContain("1 / 3");
    expect(wrapper.find('[data-test="gallery-media"]').text()).toContain(
      "/one.jpg",
    );

    await buttons.at(-1)?.trigger("click");
    expect(wrapper.text()).toContain("2 / 3");
    expect(wrapper.find('[data-test="gallery-media"]').text()).toContain(
      "/two.jpg",
    );

    await buttons[3].trigger("click");
    expect(wrapper.text()).toContain("3 / 3");

    await buttons[0].trigger("click");
    expect(wrapper.text()).toContain("2 / 3");
  });

  it("renders a single-image gallery without navigation controls", () => {
    const wrapper = mount(ProductionGallery, {
      props: { productionId: 12, images: [{ url: "/only.jpg" }] },
      global: {
        stubs: {
          MediaDisplay: {
            props: ["src"],
            template: "<div>{{ src?.url }}</div>",
          },
        },
      },
    });

    expect(wrapper.text()).toContain("/only.jpg");
    expect(wrapper.findAll("button")).toHaveLength(0);
    expect(wrapper.text()).toContain("1 / 1");
  });

  it("emits selected and cleared years", async () => {
    const wrapper = mount(YearPicker, {
      props: {
        modelValue: null,
        oldestDate: "2020-01-01",
        newestDate: "2022-12-31",
      },
    });

    expect(wrapper.findAll("button").map((button) => button.text())).toEqual([
      "2022",
      "2021",
      "2020",
    ]);

    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([2021]);

    await wrapper.setProps({ modelValue: 2021 });
    await wrapper.find(".year-pill--clear").trigger("click");
    expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([null]);
  });

  it("shows an empty year picker state when date bounds are missing", () => {
    const wrapper = mount(YearPicker, {
      props: { modelValue: null, oldestDate: "", newestDate: "" },
    });

    expect(wrapper.find(".year-empty").exists()).toBe(true);
    expect(wrapper.findAll("button")).toHaveLength(0);
  });
});

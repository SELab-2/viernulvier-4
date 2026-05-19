import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import Pagination from "../../../../app/components/admin/blogs/Pagination.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      archive: {
        page_label: "Page",
        of_pages: "of {total}",
        pagination: "Pagination",
      },
    },
  },
});

describe("AdminBlogsPagination", () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    loading: false,
    jumpInput: "",
  };

  it("renders correctly", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("Page");
    expect(wrapper.text()).toContain("of 5");
    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.text()).toContain("1"); // Current page
  });

  it("disables buttons on first page", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: { ...defaultProps, currentPage: 1 },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].element.disabled).toBe(true); // First
    expect(buttons[1].element.disabled).toBe(true); // Prev
    expect(buttons[2].element.disabled).toBe(false); // Next
    expect(buttons[3].element.disabled).toBe(false); // Last
  });

  it("disables buttons on last page", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: { ...defaultProps, currentPage: 5 },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons[0].element.disabled).toBe(false); // First
    expect(buttons[1].element.disabled).toBe(false); // Prev
    expect(buttons[2].element.disabled).toBe(true); // Next
    expect(buttons[3].element.disabled).toBe(true); // Last
  });

  it("emits update:current-page when buttons are clicked", async () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: { ...defaultProps, currentPage: 3 },
    });

    const buttons = wrapper.findAll("button");

    await buttons[0].trigger("click"); // First
    expect(wrapper.emitted("update:current-page")?.[0]).toEqual([1]);

    await buttons[1].trigger("click"); // Prev
    expect(wrapper.emitted("update:current-page")?.[1]).toEqual([2]);

    await buttons[2].trigger("click"); // Next
    expect(wrapper.emitted("update:current-page")?.[2]).toEqual([4]);

    await buttons[3].trigger("click"); // Last
    expect(wrapper.emitted("update:current-page")?.[3]).toEqual([5]);
  });

  it("emits update:jump-input when input changes", async () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: defaultProps,
    });

    const input = wrapper.find("input");
    await input.setValue("3");

    expect(wrapper.emitted("update:jump-input")?.[0]).toEqual(["3"]);
  });

  it("emits jump on enter key or blur", async () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: defaultProps,
    });

    const input = wrapper.find("input");
    await input.trigger("keydown.enter");
    expect(wrapper.emitted("jump")).toHaveLength(1);

    await input.trigger("blur");
    expect(wrapper.emitted("jump")).toHaveLength(2);
  });

  it("disables all controls when loading", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: { ...defaultProps, loading: true },
    });

    expect(wrapper.find("input").element.disabled).toBe(true);
    wrapper.findAll("button").forEach((btn) => {
      expect(btn.element.disabled).toBe(true);
    });
  });

  it("hides page jumper if totalPages <= 1", () => {
    const wrapper = mount(Pagination, {
      global: {
        plugins: [i18n],
      },
      props: { ...defaultProps, totalPages: 1 },
    });

    expect(wrapper.find("input").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Page");
  });
});

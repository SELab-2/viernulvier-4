import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import Toolbar from "../../../../app/components/admin/blogs/Toolbar.vue";
import { ROUTES } from "../../../../app/utils/routes";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      admin: {
        blogs: {
          new: "New story",
        },
      },
    },
  },
});

describe("AdminBlogsToolbar", () => {
  const defaultProps = {
    oldestDate: "2020-01-01",
    newestDate: "2023-12-31",
    dateFilter: { year: null, month: null },
    fetchSuggestions: vi.fn(),
  };

  it("renders correctly and contains the 'New story' button", () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: {
            name: "BlogsStoryToolbar",
            template: '<div><slot name="action" /><slot /></div>',
          },
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
        },
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("New story");
    const link = wrapper.find("a");
    expect(link.attributes("href")).toBe(ROUTES.admin.stories.create);
  });

  it("emits update:search when StoryToolbar emits it", () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: {
            name: "BlogsStoryToolbar",
            template: '<div><slot name="action" /></div>',
          },
          NuxtLink: true,
        },
      },
      props: defaultProps,
    });

    const storyToolbar = wrapper.findComponent({ name: "BlogsStoryToolbar" });
    expect(storyToolbar.exists()).toBe(true);
    (
      storyToolbar.vm as unknown as {
        $emit: (e: string, ...args: any[]) => void;
      }
    ).$emit("update:search", "test search");

    expect(wrapper.emitted("update:search")).toBeTruthy();
    expect(wrapper.emitted("update:search")?.[0]).toEqual(["test search"]);
  });

  it("emits update:dateFilter when StoryToolbar emits it", () => {
    const wrapper = mount(Toolbar, {
      global: {
        plugins: [i18n],
        stubs: {
          BlogsStoryToolbar: {
            name: "BlogsStoryToolbar",
            template: '<div><slot name="action" /></div>',
          },
          NuxtLink: true,
        },
      },
      props: defaultProps,
    });

    const newFilter = { year: 2023, month: 5 };
    const storyToolbar = wrapper.findComponent({ name: "BlogsStoryToolbar" });
    expect(storyToolbar.exists()).toBe(true);
    (
      storyToolbar.vm as unknown as {
        $emit: (e: string, ...args: any[]) => void;
      }
    ).$emit("update:date-filter", newFilter);

    expect(wrapper.emitted("update:dateFilter")).toBeTruthy();
    expect(wrapper.emitted("update:dateFilter")?.[0]).toEqual([newFilter]);
  });
});

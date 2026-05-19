import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import QuikLinks from "../../../../app/components/admin/dashboard/QuikLinks.vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useI18n", () => () => ({
  t: (key: string) => key,
}));

describe("QuikLinks", () => {
  it("renders base links", () => {
    const wrapper = mount(QuikLinks, {
      props: { isSuperAdmin: false },
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
          BookOpen: true,
          Film: true,
          Printer: true,
          Users: true,
        },
      },
    });

    expect(wrapper.text()).toContain("admin.dashboard.stories");
    expect(wrapper.text()).toContain("admin.dashboard.productions");
    expect(wrapper.text()).toContain("admin.dashboard.prints");
    expect(wrapper.text()).not.toContain("admin.dashboard.accounts");
  });

  it("renders accounts link for super admin", () => {
    const wrapper = mount(QuikLinks, {
      props: { isSuperAdmin: true },
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
          BookOpen: true,
          Film: true,
          Printer: true,
          Users: true,
        },
      },
    });

    expect(wrapper.text()).toContain("admin.dashboard.accounts");
  });
});

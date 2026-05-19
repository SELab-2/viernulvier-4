import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import AppFooter from "../../app/components/AppFooter.vue";
import { ROUTES } from "../../app/utils/routes";

// Mock i18n
const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      footer: {
        links: "Navigation",
        mainSite: "Main Website",
        archive: "Archive",
        stories: "Stories",
        prints: "Prints",
        rights: "All rights reserved",
      },
    },
  },
});

describe("AppFooter", () => {
  it("renders correctly with address and navigation links", () => {
    const wrapper = mount(AppFooter, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ["to"],
          },
          IconsInstagramSVG: true,
          IconsFacebookSVG: true,
          IconsTiktokSVG: true,
          IconsYoutubeSVG: true,
          IconsLinkedinSVG: true,
        },
        mocks: {
          // mock resolveComponent if needed, but Vue's mount handles stubs
        },
      },
    });

    // Check address
    expect(wrapper.text()).toContain("Kunstencentrum VIERNULVIER vzw.");
    expect(wrapper.text()).toContain("Sint-Pietersnieuwstraat 23, 9000 Gent");

    // Check navigation links
    expect(wrapper.text()).toContain("Navigation");
    expect(wrapper.find(`a[href="${ROUTES.productions.base}"]`).exists()).toBe(
      true,
    );
    expect(wrapper.find(`a[href="${ROUTES.stories.base}"]`).exists()).toBe(
      true,
    );
    expect(wrapper.find(`a[href="${ROUTES.prints.base}"]`).exists()).toBe(true);

    // Check social links
    expect(wrapper.find('a[aria-label="Instagram"]').exists()).toBe(true);
    expect(wrapper.find('a[aria-label="Facebook"]').exists()).toBe(true);

    // Check copyright
    const year = new Date().getFullYear();
    expect(wrapper.text()).toContain(`© ${year} VIERNULVIER`);
    expect(wrapper.text()).toContain("All rights reserved");
  });
});

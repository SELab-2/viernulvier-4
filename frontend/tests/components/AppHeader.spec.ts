import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import AppHeader from "../../app/components/AppHeader.vue";
import { createI18n } from "vue-i18n";

vi.mock("../../app/composables/useAuth", () => ({
    useAuth: () => ({
        isLoggedIn: { value: false }, // user default not logged in
        logout: vi.fn(), // dummy logout function
    }),
}));

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: {
            auth: {
                confirmLogout: "Succesvol uitgelogd"
            },
            nav: {
                home: "home",
                archive: "archief",
                stories: "verhalen",
                prints: "drukwerk",
                logout: "uitloggen"
            }
        },
        en: {
            auth: {
                confirmLogout: "Logged out successfully"
            },
            nav: {
                home: "home",
                archive: "archive",
                stories: "stories",
                prints: "prints",
                logout: "logout"
            }
        },
    },
});

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/",         name: "home",        component: { template: "<div/>" } },
        { path: "/archive",  name: "archive",     component: { template: "<div/>" } },
        { path: "/stories",  name: "stories",     component: { template: "<div/>" } },
        { path: "/prints",   name: "prints",      component: { template: "<div/>" } },
    ],
});

describe("AppHeader", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(async () => {
        router.push("/");
        await router.isReady();

        wrapper = mount(AppHeader, {
            global: {
                plugins: [i18n, router],
                stubs: {
                    LocaleSelector: true, // component renders as empty placeholder
                },
            },
        });
    });

    it("renders all navigation links", () => {
        const links = wrapper.findAll("a"); // HTML <a>-elements
        const texts = links.map(l => l.text().toLowerCase());
        expect(texts).toEqual(expect.arrayContaining(["home", "archief", "verhalen", "drukwerk"]));
    });

    it("tests existence of hamburger button", () => {
        const hamburger = wrapper.find("button");
        expect(hamburger.exists()).toBe(true);
    });

    it("hamburger menu button should not show up on larger screens", () => {
        Object.defineProperty(window, "innerWidth", { value: 1280, writable: true });
        window.dispatchEvent(new Event("resize"));

        const hamburger = wrapper.find("button.lg\\:hidden");
        expect(hamburger.exists()).toBe(false);
    });

    it("hamburger menu button should show up on smaller screens", () => {
        Object.defineProperty(window, "innerWidth", { value: 375, writable: true });
        window.dispatchEvent(new Event("resize"));

        const hamburger = wrapper.find("button.lg\\:hidden");
        expect(hamburger.exists()).toBe(true);
    });

    it("opens menu when clicking hamburger menu button", async () => {
        const hamburger = wrapper.find("button");
        await hamburger.trigger("click");
        expect(wrapper.find("nav").exists()).toBe(true);
    });

    it("shows no logout button when user is not logged in", () => {
        const buttons = wrapper.findAll("button");
        const logoutButton = buttons.find(b => b.text().toLowerCase().includes("uitloggen"));
        expect(logoutButton).toBeUndefined();
    });

    it("switches to dark mode when pressing the theme button from light mode", async () => {
        const themeButton = wrapper.findAll("button").find(b =>
            b.text().includes("DARK") || b.text().includes("LIGHT")
        );
        expect(themeButton?.exists()).toBe(true);
        await themeButton?.trigger("click");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });
});
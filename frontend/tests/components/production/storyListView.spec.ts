import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import ProductionStories from "../../../app/components/production/storyListView.vue";
import type { BlogView } from "@repo/common";

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: {
            "production": {
                stories: "Verhalen",
                noStories: "Deze productie bevat geen verhalen."
            }
        },
        en: {
            "production": {
                stories: "Stories",
                noStories: "This production doesn't contain any stories."
            }
        },
    },
});

const stories: BlogView[] = [
    { id: 1, titel: "Titel 1", created_at: "2026-02-10T00:00:00Z", updated_at: "2026-02-10T00:00:00Z", description: "description 1" },
    { id: 2, titel: "Titel 2", created_at: "2026-02-28T00:00:00Z", updated_at: "2026-02-28T00:00:00Z", description: "description 2" },
    { id: 3, titel: "Titel 3", created_at: "2026-03-05T00:00:00Z", updated_at: "2026-03-05T00:00:00Z", description: "description 3" },
    { id: 4, titel: "Titel 4", created_at: "2026-03-12T00:00:00Z", updated_at: "2026-03-12T00:00:00Z", description: "description 4" },
];

describe("ProductionStories", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(ProductionStories, {
            global: {
                plugins: [i18n]
            },
            props: {
                stories
            },
        });
    });

    it("renders the title", () => {
        expect(wrapper.find("h3").text()).toContain("Verhalen");
    });

    it("renders a card for each story", () => {
        expect(wrapper.findAll("[data-testid=data-story]").length).toBe(stories.length);
    });

    it("renders title and description for each story", () => {
        const text = wrapper.text();
        expect(text).toContain("Titel 1");
        expect(text).toContain("description 1");
        expect(text).toContain("Titel 2");
        expect(text).toContain("description 2");
    });

    it("shows empty message when no stories are provided", () => {
        const w = mount(ProductionStories, {
            global: { plugins: [i18n] },
            props: { stories: [] },
        });
        expect(w.text()).toContain("Deze productie bevat geen verhalen.");
    });

    it("does not show empty message when stories are provided", () => {
        expect(wrapper.text()).not.toContain("Deze productie bevat geen verhalen.");
    });
});
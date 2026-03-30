import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import ProductionStories from "../../../app/components/production/storyListView.vue";
import type { StoryItem } from "../../../app/types/StoryItem";

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

const stories: StoryItem[] = [
    { id: 1, title: "Titel 1", date: new Date(2026, 2, 10), description: "description 1", image: null },
    { id: 2, title: "Titel 2", date: new Date(2026, 2, 29), description: "description 2", image: null },
    { id: 3, title: "Titel 3", date: new Date(2026, 3, 5), description: "description 3", image: null },
    { id: 4, title: "Titel 4", date: new Date(2026, 3, 12), description: "description 4", image: null },
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

    it("sorts stories oldest first", () => {
        const cards = wrapper.findAll("[data-testid=data-story]");
        const firstCard = cards[0].text();
        const lastCard = cards[cards.length - 1].text();
        expect(firstCard).toContain("Titel 1"); // oldest story
        expect(lastCard).toContain("Titel 4"); // newest story
    });
});
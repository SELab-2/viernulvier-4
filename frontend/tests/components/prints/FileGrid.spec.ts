import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FileGrid from "../../../app/components/prints/FileGrid.vue";

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: {
            "prints": {
                files: "Bestanden",
                noFilesCat: "Deze categorie bevat geen bestanden.",
                noFiles: "Geen bestanden beschikbaar.",
                showMore: "Meer tonen",
                remaining: "resterend",
                delete: "Verwijder",
                download: "Download"
            }
        },
        en: {
            "prints": {
                files: "Files",
                noFilesCat: "This category doesn't contain any files.",
                noFiles: "No files available.",
                showMore: "Show more",
                remaining: "remaining",
                delete: "Delete",
                download: "Download"
            }
        },
    },
});

const files = [
    { id: 1, name: "AFFICHE-1.PDF", year: 2025, image: null },
    { id: 2, name: "AFFICHE-2.PDF", year: 2024, image: null },
    { id: 3, name: "AFFICHE-3.PDF", year: 2023, image: null },
    { id: 4, name: "AFFICHE-4.PDF", year: 2022, image: null },
    { id: 5, name: "AFFICHE-5.PDF", year: 2021, image: null },
    { id: 6, name: "AFFICHE-6.PDF", year: 2020, image: null },
    { id: 7, name: "AFFICHE-7.PDF", year: 2019, image: null },
    { id: 8, name: "AFFICHE-8.PDF", year: 2018, image: null },
    { id: 9, name: "AFFICHE-9.PDF", year: 2017, image: null },
];

describe("PrintsFileGrid", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(FileGrid, {
            global: { plugins: [i18n] },
            props: {
                category: "Affiche",
                files,
            },
        });
    });

    it("renders the category title", () => {
        expect(wrapper.text()).toContain("Affiche");
    });

    it("renders the file count", () => {
        expect(wrapper.text()).toContain(files.length.toString());
    });

    it("renders file names", () => {
        const text = wrapper.text();
        expect(text).toContain("AFFICHE-1.PDF");
        expect(text).toContain("AFFICHE-2.PDF");
        expect(text).toContain("AFFICHE-3.PDF");
        expect(text).toContain("AFFICHE-4.PDF");
        expect(text).toContain("AFFICHE-5.PDF");
        expect(text).toContain("AFFICHE-6.PDF");
        expect(text).toContain("AFFICHE-7.PDF");
        expect(text).toContain("AFFICHE-8.PDF");
        expect(text).not.toContain("AFFICHE-9.PDF");
    });

    it("shows empty message when no files are provided", () => {
        const w = mount(FileGrid, {
            global: { plugins: [i18n] },
            props: { category: "Affiche", files: [] },
        });
        expect(w.text()).toContain("Deze categorie bevat geen bestanden.");
    });

    it("does not show empty message when files are provided", () => {
        expect(wrapper.text()).not.toContain("Deze categorie bevat geen bestanden.");
    });

    it("shows show-more button when there are more than 8 files", () => {
        expect(wrapper.text()).toContain("Meer tonen");
    });

    it("does not show show-more button when files fit in 2 rows", () => {
        const w = mount(FileGrid, {
            global: { plugins: [i18n] },
            props: { category: "Affiche", files: files.slice(0, 4) },
        });
        expect(w.text()).not.toContain("Meer tonen");
    });

    it("shows more files when show-more button is clicked", async () => {
        expect(wrapper.text()).not.toContain("AFFICHE-9.PDF");
        const buttons = wrapper.findAll("button");
        const showMoreButton = buttons.find(b => b.text().includes("Meer tonen"));
        await showMoreButton?.trigger("click");
        expect(wrapper.text()).toContain("AFFICHE-9.PDF");
    });

    it("hides show-more button and resets when section is toggled off and on", async () => {
        // expanding first
        const buttons = wrapper.findAll("button");
        const showMoreButton = buttons.find(b => b.text().includes("Meer tonen"));
        await showMoreButton?.trigger("click");
        expect(wrapper.text()).toContain("AFFICHE-9.PDF");

        // toggling off
        await wrapper.find("button").trigger("click");
        expect(wrapper.text()).not.toContain("AFFICHE-9.PDF");

        // toggling back on — should be reset to 2 rows again
        await wrapper.find("button").trigger("click");
        expect(wrapper.text()).not.toContain("AFFICHE-9.PDF");
        expect(wrapper.text()).toContain("Meer tonen");
    });

    it("toggles section visibility when header is clicked", async () => {
        expect(wrapper.text()).toContain("AFFICHE-1.PDF");
        await wrapper.find("button").trigger("click");
        expect(wrapper.text()).not.toContain("AFFICHE-1.PDF");
    });
});
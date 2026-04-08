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
    { id: 1, titel: "AFFICHE-1.PDF", description: "", created_at: "2025-01-01T00:00:00Z", updated_at: "2025-01-01T00:00:00Z", url: "" },
    { id: 2, titel: "AFFICHE-2.PDF", description: "", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z", url: "" },
    { id: 3, titel: "AFFICHE-3.PDF", description: "", created_at: "2023-01-01T00:00:00Z", updated_at: "2023-01-01T00:00:00Z", url: "" },
    { id: 4, titel: "AFFICHE-4.PDF", description: "", created_at: "2022-01-01T00:00:00Z", updated_at: "2022-01-01T00:00:00Z", url: "" },
    { id: 5, titel: "AFFICHE-5.PDF", description: "", created_at: "2021-01-01T00:00:00Z", updated_at: "2021-01-01T00:00:00Z", url: "" },
    { id: 6, titel: "AFFICHE-6.PDF", description: "", created_at: "2020-01-01T00:00:00Z", updated_at: "2020-01-01T00:00:00Z", url: "" },
    { id: 7, titel: "AFFICHE-7.PDF", description: "", created_at: "2019-01-01T00:00:00Z", updated_at: "2019-01-01T00:00:00Z", url: "" },
    { id: 8, titel: "AFFICHE-8.PDF", description: "", created_at: "2018-01-01T00:00:00Z", updated_at: "2018-01-01T00:00:00Z", url: "" },
    { id: 9, titel: "AFFICHE-9.PDF", description: "", created_at: "2017-01-01T00:00:00Z", updated_at: "2017-01-01T00:00:00Z", url: "" },
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
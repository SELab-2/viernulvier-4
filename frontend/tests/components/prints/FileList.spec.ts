import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import FileList from "../../../app/components/prints/FileList.vue";

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: {
            "prints": {
                files: "Bestanden",
                noFilesCat: "Deze categorie bevat geen bestanden.",
                noFiles: "Geen bestanden beschikbaar.",
                showMore: "Meer tonen",
                showLess: "Minder tonen",
                remaining: "resterend"
            }
        },
        en: {
            "prints": {
                files: "Files",
                noFilesCat: "This category doesn't contain any files.",
                noFiles: "No files available.",
                showMore: "Show more",
                showLess: "Show less",
                remaining: "remaining"
            }
        },
    },
});

const files = [
    { id: 1, name: "AFFICHE-1.PDF", year: 2025, image: null },
    { id: 2, name: "AFFICHE-2.PDF", year: 2024, image: null },
    { id: 3, name: "AFFICHE-3.PDF", year: 2023, image: null },
];

describe("PrintsFileList", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(FileList, {
            global: { plugins: [i18n] },
            props: {
                category: "Affiche",
                files,
            },
        });
    });

    it("renders all file names", () => {
        const text = wrapper.text();
        expect(text).toContain("AFFICHE-1.PDF");
        expect(text).toContain("AFFICHE-2.PDF");
        expect(text).toContain("AFFICHE-3.PDF");
    });

    it("renders the category per file", () => {
        const text = wrapper.text();
        expect(text).toContain("Affiche");
    });

    it("renders the year per file", () => {
        const text = wrapper.text();
        expect(text).toContain("2025");
        expect(text).toContain("2024");
        expect(text).toContain("2023");
    });

    it("shows empty message when no files are provided", () => {
        const w = mount(FileList, {
            global: { plugins: [i18n] },
            props: { category: "Affiche", files: [] },
        });
        expect(w.text()).toContain("Geen bestanden beschikbaar.");
    });

    it("does not show empty message when files are provided", () => {
        expect(wrapper.text()).not.toContain("Geen bestanden beschikbaar.");
    });

    it("renders a download and delete button per file", () => {
        const buttons = wrapper.findAll("button");
        expect(buttons.length).toBe(files.length * 2);
    });
});
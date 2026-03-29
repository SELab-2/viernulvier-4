import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import EventTable from "../../../app/components/production/EventTable.vue";
import type { EventItem } from "../../../app/types/EventItem";

const i18n = createI18n({
    locale: "nl",
    messages: {
        nl: {
            "production": {
                events: "Evenementen",
                dateAndTime: "Datum & Tijd",
                location: "Locatie",
                price: "Prijs",
                noEvents: "Deze productie bevat geen evenementen."
            }
        },
        en: {
            "production": {
                events: "Events",
                dateAndTime: "Date & Time",
                location: "Location",
                price: "Price",
                noEvents: "This production doesn't any event."
            }
        },
    },
});

const events: EventItem[] = [
    { id: "1", date: new Date(2026, 2, 10, 19, 30), location: "Antwerpen", price: "€15,00" },
    { id: "2", date: new Date(2026, 2, 29, 20, 0), location: "Gent", price: "€12,50" },
    { id: "3", date: new Date(2026, 3, 5, 18, 15), location: "Brussel", price: "€10,00" },
    { id: "4", date: new Date(2026, 3, 12, 20, 45), location: "Leuven", price: "€8,00" },
];

describe("EventTable", () => {
    let wrapper: ReturnType<typeof mount>;

    beforeEach(() => {
        wrapper = mount(EventTable, {
            global: {
                plugins: [i18n]
            },
            props: {
                events
            },
        });
    });

    it("renders the title", () => {
        expect(wrapper.find("h3").text()).toContain("Evenementen");
    });

    it("renders the table headers", () => {
        const headers = wrapper.findAll("th").map(th => th.text()); // searches all table header elements
        expect(headers).toEqual(expect.arrayContaining(["Datum & Tijd", "Locatie", "Prijs"]));
    });

    it("renders a row for each event", () => {
        expect(wrapper.findAll("tr").length).toBe(events.length + 1); // +1 for the header row
    });

    it("renders location and price for each event", () => {
        const text = wrapper.text();
        expect(text).toContain("Antwerpen");
        expect(text).toContain("€15,00");
        expect(text).toContain("Gent");
        expect(text).toContain("€12,50");
    });

    it("shows empty message when no events are provided", () => {
        const w = mount(EventTable, {
            global: { plugins: [i18n] },
            props: { events: [] },
        });
        expect(w.text()).toContain("Deze productie bevat geen evenementen.");
        expect(w.find("table").exists()).toBe(false);
    });

    it("does not show empty message when events are provided", () => {
        expect(wrapper.text()).not.toContain("Deze productie bevat geen evenementen.");
    });

    it("sorts events oldest first", () => {
        const rows = wrapper.findAll("tbody tr");
        const firstRow = rows[0].text();
        const lastRow = rows[rows.length - 1].text();
        expect(firstRow).toContain("Antwerpen"); // oldest event
        expect(lastRow).toContain("Leuven"); // newest event
    });
});
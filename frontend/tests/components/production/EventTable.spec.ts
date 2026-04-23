import { describe, it, expect, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import EventTable from "../../../app/components/production/EventTable.vue";
import type { LocationView, PriceView } from "@repo/common";
import type { EventWithDetails } from "../../../app/types/EventWithDetails";

const i18n = createI18n({
  locale: "nl",
  messages: {
    nl: {
      production: {
        events: "Evenementen",
        dateAndTime: "Datum & Tijd",
        location: "Locatie",
        price: "Prijs",
      },
    },
    en: {
      production: {
        events: "Events",
        dateAndTime: "Date & Time",
        location: "Location",
        price: "Price",
      },
    },
  },
});

const base = {
  endtime: null,
  doors_at: null,
  intermission_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  production_id: 1,
};

const mockLocation = (name: string): LocationView => ({
  id: 1,
  location: name,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const mockPrice = (amount: number): PriceView => ({
  id: 1,
  price: amount,
  name: "Volwassenen",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const events: EventWithDetails[] = [
  {
    ...base,
    id: 1,
    starttime: "2026-03-10T19:30:00Z",
    location: mockLocation("Antwerpen"),
    prices: [mockPrice(15)],
  },
  {
    ...base,
    id: 2,
    starttime: "2026-03-29T20:00:00Z",
    location: mockLocation("Gent"),
    prices: [mockPrice(12.5)],
  },
  {
    ...base,
    id: 3,
    starttime: "2026-04-05T18:15:00Z",
    location: mockLocation("Brussel"),
    prices: [mockPrice(10)],
  },
];

describe("EventTable", () => {
  let wrapper: VueWrapper<InstanceType<typeof EventTable>>;

  beforeEach(() => {
    wrapper = mount(EventTable, {
      global: {
        plugins: [i18n],
      },
      props: {
        events,
      },
    });
  });

  it("renders the table headers", () => {
    const headers = wrapper.findAll("th").map((th) => th.text()); // searches all table header elements
    expect(headers).toEqual(
      expect.arrayContaining(["Datum & Tijd", "Locatie", "Prijs"]),
    );
  });

  it("renders a row for each event when there are less than 4 events", () => {
    expect(wrapper.findAll("tr").length).toBe(events.length + 1); // +1 for the header row
  });

  it("renders location and price for each event", () => {
    const text = wrapper.text();
    expect(text).toContain("Antwerpen");
    expect(text).toContain("15,00");
    expect(text).toContain("Gent");
    expect(text).toContain("12,50");
  });
});

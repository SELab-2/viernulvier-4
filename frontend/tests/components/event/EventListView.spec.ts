import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import EventListView from "../../../app/components/event/EventListView.vue";
import type { LocationView, PriceView } from "@repo/common";
import type { EventWithDetails } from "../../../app/types/EventWithDetails";

vi.mock("#app", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
  };
});

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      eventlist: {
        noEventsFound: "No events found.",
        price: "Price",
        edit: "Edit",
        delete: "Delete",
        confirmDelete: "Are you sure you want to delete this event?",
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

const mockPrice = (id: number, price: number, name: string): PriceView => ({
  id,
  price,
  name,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const events: (EventWithDetails & { productionTitle: string })[] = [
  {
    ...base,
    id: 1,
    starttime: "2026-03-10T19:30:00Z",
    location: mockLocation("Antwerpen"),
    prices: [mockPrice(1, 15, "Standard")],
    productionTitle: "Bodies of Light",
  },
  {
    ...base,
    id: 2,
    starttime: "2026-03-29T20:00:00Z",
    location: mockLocation("Gent"),
    prices: [mockPrice(2, 12.5, "Standard"), mockPrice(3, 8, "Student")],
    productionTitle: "Nightfall",
  },
];

describe("EventListView", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(EventListView, {
      global: {
        plugins: [i18n],
      },
      props: {
        events,
      },
    });
  });

  it("renders the event cards", () => {
    expect(wrapper.text()).toContain("Bodies of Light");
    expect(wrapper.text()).toContain("Nightfall");
    expect(wrapper.text()).toContain("Antwerpen");
    expect(wrapper.text()).toContain("Gent");
  });

  it("renders the price text for each event", () => {
    const text = wrapper.text();
    expect(text).toContain("Price");
    expect(text).toContain("Standard: €15.00");
    expect(text).toContain("Standard: €12.50");
    expect(text).toContain("Student: €8.00");
  });

  it("renders one edit and one delete button per event", () => {
    expect(wrapper.findAll("button").length).toBe(events.length * 2);
  });

  it("emits edit when the edit button is clicked", () => {
    wrapper.findAll("button")[0].element.click();

    expect(wrapper.emitted("edit")?.[0]).toEqual([events[0]]);
  });

  it("asks for confirmation before deleting", () => {
    const confirmMock = vi.fn(() => true);
    vi.stubGlobal("confirm", confirmMock);

    wrapper.findAll("button")[1].element.click();

    expect(confirmMock).toHaveBeenCalledWith(
      "Are you sure you want to delete this event?",
    );
    expect(wrapper.emitted("delete")?.[0]).toEqual([
      { id: 1, title: "Bodies of Light" },
    ]);
  });

  it("shows the empty message when no events are provided", () => {
    const emptyWrapper = mount(EventListView, {
      global: { plugins: [i18n] },
      props: { events: [] },
    });

    expect(emptyWrapper.text()).toContain("No events found.");
    expect(emptyWrapper.findAll("button").length).toBe(0);
  });
});

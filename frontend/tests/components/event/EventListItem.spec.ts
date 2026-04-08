import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import EventListItem from "../../../app/components/event/EventListItem.vue";
import type { LocationView, PriceView } from "@repo/common";
import type { EventWithDetails } from "../../../app/types/EventWithDetails";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      eventlist: {
        price: "Price",
        edit: "Edit",
        delete: "Delete",
      },
    },
  },
});

type Item = EventWithDetails & { productionTitle: string };

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

const mockPrice = (id: number, amount: number, name: string): PriceView => ({
  id,
  price: amount,
  name,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
});

const item: Item = {
  ...base,
  id: 1,
  starttime: "2026-03-10T19:30:00Z",
  location: mockLocation("Antwerpen"),
  prices: [mockPrice(1, 15, "Standard"), mockPrice(2, 8, "Student")],
  productionTitle: "Bodies of Light",
};

describe("EventListItem", () => {
  let wrapper: ReturnType<typeof mount>;

  beforeEach(() => {
    wrapper = mount(EventListItem, {
      global: {
        plugins: [i18n],
      },
      props: {
        item,
      },
    });
  });

  it("renders title, location and price label", () => {
    expect(wrapper.text()).toContain("Bodies of Light");
    expect(wrapper.text()).toContain("Antwerpen");
    expect(wrapper.text()).toContain("Price");
  });

  it("renders all formatted prices", () => {
    const text = wrapper.text();
    expect(text).toContain("Standard: €15.00");
    expect(text).toContain("Student: €8.00");
  });

  it("shows dash when there are no prices", () => {
    const noPriceItem: Item = { ...item, prices: [] };
    const w = mount(EventListItem, {
      global: { plugins: [i18n] },
      props: { item: noPriceItem },
    });

    expect(w.text()).toContain("Price: -");
  });

  it("emits edit event with full item", async () => {
    await wrapper.find('[aria-label="Edit"]').trigger("click");

    expect(wrapper.emitted("edit")?.[0]).toEqual([item]);
  });

  it("emits delete event with full item", async () => {
    await wrapper.find('[aria-label="Delete"]').trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual([item]);
  });
});

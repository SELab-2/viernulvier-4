import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type { NewEventDraft } from "~/composables/productions/steps/productionEvents";
import EventItemEditor from "../../../../app/components/admin/productions/EventItemEditor.vue";
import * as useLocationApiModule from "../../../../app/composables/useLocationApi";

vi.mock("../../../../app/composables/useLocationApi", () => ({
  useLocationApi: vi.fn(),
}));

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        events: {
          starttime: "Start Time",
          endtime: "End Time",
          optional: "Optional",
          location: "Location",
          locationPlaceholder: "Search location...",
          locationPlaceholderEN: "EN (OPTIONAL)",
          prices: { title: "Prices", add: "Add Price", empty: "No prices" },
          doors_at: "Doors At",
          intermission_at: "Intermission At",
        },
      },
    },
  },
});

describe("AdminProductionsEventItemEditor", () => {
  const mockLocationApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLocationApiModule.useLocationApi as Mock).mockReturnValue(
      mockLocationApi,
    );
    vi.useFakeTimers();
  });

  const defaultProps = {
    event: {
      kind: "new" as const,
      starttime: "2023-12-01T20:00:00.000Z",
      endtime: null,
      doors_at: null,
      intermission_at: null,
      location: null,
      prices: [],
    },
    index: 0,
  };

  const stubs = {
    MapPin: true,
    X: true,
    Plus: true,
    Teleport: true,
  };

  it("renders correctly with default props", () => {
    const wrapper = mount(EventItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("Start Time");
    expect(wrapper.text()).toContain("Location");
  });

  it("emits update when starttime changes", async () => {
    const wrapper = mount(EventItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const input = wrapper.find('input[type="datetime-local"]');
    await input.setValue("2023-12-02T21:00");
    await input.trigger("change");

    expect(wrapper.emitted("update")).toBeTruthy();
    const emitted = wrapper.emitted("update")?.[0][0] as NewEventDraft;
    expect(emitted.starttime).toBe("2023-12-02T21:00:00.000");
  });

  it("searches and selects a location", async () => {
    const wrapper = mount(EventItemEditor, {
      global: {
        plugins: [i18n],
        stubs: {
          ...stubs,
          Teleport: { template: "<div><slot /></div>" },
        },
      },
      props: defaultProps,
    });

    mockLocationApi.getAll.mockResolvedValue({
      data: {
        objects: [{ id: 1, location: "Main Stage" }],
      },
    });

    const input = wrapper.find('input[placeholder="Search location..."]');
    await input.setValue("Main");

    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(mockLocationApi.getAll).toHaveBeenCalled();

    const locBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Main Stage"));
    await locBtn?.trigger("mousedown");

    expect(wrapper.emitted("update")).toBeTruthy();
    const emitted = wrapper.emitted("update")?.[0][0] as NewEventDraft;
    expect(emitted.location).toMatchObject({ id: 1, label: "Main Stage" });
  });

  it("adds and updates a price", async () => {
    const wrapper = mount(EventItemEditor, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const addPriceBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Add Price"));
    await addPriceBtn?.trigger("click");

    expect(wrapper.emitted("update")).toBeTruthy();
    let updatedEvent = wrapper.emitted("update")?.[0][0] as NewEventDraft;
    expect(updatedEvent.prices).toHaveLength(1);

    await wrapper.setProps({ event: updatedEvent });

    const priceInput = wrapper.find('input[type="number"]');
    await priceInput.setValue("15.50");

    const updateEmits = wrapper.emitted("update");
    expect(updateEmits).toBeTruthy();
    const lastEmit = updateEmits?.[updateEmits.length - 1];
    expect(lastEmit).toBeDefined();
    updatedEvent = (lastEmit as any[])[0] as NewEventDraft;
    expect(updatedEvent.prices?.[0].price).toBe(15.5);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import type {
  ExistingEventDraft,
  ProductionEventsForm,
} from "~/composables/productions/steps/productionEvents";
import EventsForm from "../../../../app/components/admin/productions/EventsForm.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        events: {
          title: "Events",
          hint: "Hint",
          add: "Add event",
          empty: "No events",
          emptyHint: "Add one",
          newEvent: "New Event",
          new: "NEW",
          noDateYet: "No date set",
        },
      },
    },
  },
});

describe("AdminProductionsEventsForm", () => {
  const defaultProps = {
    modelValue: [] as ProductionEventsForm,
  };

  const stubs = {
    AdminProductionsEventItemEditor: {
      name: "AdminProductionsEventItemEditor",
      template: '<div class="event-editor-stub"></div>',
      props: ["event", "index"],
    },
    Plus: true,
    Trash2: true,
    ChevronDown: true,
    ChevronUp: true,
    CalendarDays: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state correctly", () => {
    const wrapper = mount(EventsForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    expect(wrapper.text()).toContain("No events");
  });

  it("emits update:modelValue when adding an event", async () => {
    const wrapper = mount(EventsForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: defaultProps,
    });

    const addBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Add event"));
    await addBtn?.trigger("click");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionEventsForm;
    expect(emitted).toHaveLength(1);
    expect(emitted[0].kind).toBe("new");
  });

  it("renders visible events", () => {
    const modelValue: ProductionEventsForm = [
      {
        kind: "new" as const,
        starttime: "2023-12-01T20:00:00Z",
        location: { label: "Main Hall", id: 1, type: "existing" as const },
        endtime: null,
        doors_at: null,
        intermission_at: null,
        prices: [],
      },
    ];

    const wrapper = mount(EventsForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    expect(wrapper.text()).toContain("Main Hall");
    expect(
      wrapper
        .findComponent({ name: "AdminProductionsEventItemEditor" })
        .exists(),
    ).toBe(true);
  });

  it("handles deleting a new event", async () => {
    const modelValue: ProductionEventsForm = [
      {
        kind: "new" as const,
        starttime: "2023-12-01T20:00:00Z",
        endtime: null,
        doors_at: null,
        intermission_at: null,
        location: null,
        prices: [],
      },
    ];

    const wrapper = mount(EventsForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    const deleteBtn = wrapper.find(
      'button[class*="hover:text-action-red-icon"]',
    );
    await deleteBtn.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.[0][0]).toHaveLength(0);
  });

  it("handles marking an existing event as deleted", async () => {
    const modelValue: ProductionEventsForm = [
      { kind: "existing" as const, id: 123, deleted: false },
    ];

    const wrapper = mount(EventsForm, {
      global: {
        plugins: [i18n],
        stubs,
      },
      props: { modelValue },
    });

    const deleteBtn = wrapper.find(
      'button[class*="hover:text-action-red-icon"]',
    );
    await deleteBtn.trigger("click");

    const emitted = wrapper.emitted(
      "update:modelValue",
    )?.[0][0] as ProductionEventsForm;
    const firstEvent = emitted[0] as ExistingEventDraft;
    expect(firstEvent.deleted).toBe(true);
  });
});

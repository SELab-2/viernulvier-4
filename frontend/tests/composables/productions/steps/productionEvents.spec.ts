/* eslint-disable jest/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useProductionEvents } from "../../../../app/composables/productions/steps/productionEvents";
import type { NewEventDraft } from "../../../../app/composables/productions/steps/productionEvents";
import * as useEventApiModule from "../../../../app/composables/useEventApi";

vi.mock("../../../../app/composables/useEventApi", () => ({
  useEventApi: vi.fn(),
}));

interface MockEvent {
  kind: string;
  starttime: string;
  location: { label: string } | null;
  prices: { price: number }[];
  endtime?: string | null;
  deleted?: boolean;
}

describe("useProductionEvents", () => {
  const mockApi = {
    getAll: vi.fn(),
    getLocation: vi.fn(),
    getPrices: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useEventApiModule.useEventApi as Mock).mockReturnValue(mockApi);
  });

  it("initializes with empty draft in create mode", async () => {
    const { draft, original, initialize } = useProductionEvents();
    await initialize({ mode: "create" });

    expect(original.value).toBeNull();
    expect(draft.value).toEqual([]);
  });

  it("initializes with fetched events in edit mode", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, starttime: "2023-12-01T20:00:00Z" }] },
    });
    mockApi.getLocation.mockResolvedValue({
      data: { id: 10, location: "Main Hall" },
    });
    mockApi.getPrices.mockResolvedValue({
      data: [{ id: 100, name: { nl: "Full" }, price: 15 }],
    });

    const { draft, original, initialize } = useProductionEvents();
    await initialize({ mode: "edit", id: "123" });

    expect(mockApi.getAll).toHaveBeenCalled();
    expect(original.value).toHaveLength(1);
    expect(draft.value[0].kind).toBe("existing");

    const firstEvent = draft.value[0] as unknown as MockEvent;
    expect(firstEvent.location?.label).toBe("Main Hall");
    expect(firstEvent.prices[0].price).toBe(15);
  });

  it("identifies changed fields correctly", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, starttime: "2023-12-01T20:00:00Z" }] },
    });
    mockApi.getLocation.mockResolvedValue({ data: null });
    mockApi.getPrices.mockResolvedValue({ data: [] });

    const { draft, initialize, getChangedFields } = useProductionEvents();
    await initialize({ mode: "edit", id: "123" });

    expect(getChangedFields()).toHaveLength(0);

    const firstEvent = draft.value[0] as unknown as MockEvent;
    firstEvent.starttime = "2023-12-01T21:00:00Z";
    expect(getChangedFields()).toEqual(["1:starttime"]);

    draft.value.push({
      kind: "new",
      starttime: "2023-12-02T20:00:00Z",
      endtime: null,
      doors_at: null,
      intermission_at: null,
      location: null,
      prices: [],
    });
    expect(getChangedFields()).toContain("1:starttime");
    expect(getChangedFields()).toContain("new:2023-12-02T20:00:00Z");
  });

  it("extracts payload correctly", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, starttime: "2023-12-01T20:00:00Z" }] },
    });
    mockApi.getLocation.mockResolvedValue({ data: { id: 10 } });
    mockApi.getPrices.mockResolvedValue({ data: [] });

    const { draft, initialize, extractPayload } = useProductionEvents();
    await initialize({ mode: "edit", id: "123" });

    // Update existing event
    const firstEvent = draft.value[0] as unknown as MockEvent;
    firstEvent.endtime = "2023-12-01T22:00:00Z";

    // Add new event
    const newEvent: NewEventDraft = {
      kind: "new",
      starttime: "2023-12-02T20:00:00Z",
      endtime: null,
      doors_at: null,
      intermission_at: null,
      location: { type: "existing", id: 11, label: "Hall 2" },
      prices: [
        { kind: "new", tempId: "t1", name: { nl: "P1", en: "" }, price: 10 },
      ],
    };
    draft.value.push(newEvent);

    const payload = extractPayload();
    expect(payload.eventsToUpdate).toHaveLength(1);
    expect(payload.eventsToUpdate[0].id).toBe(1);
    expect(payload.eventsToUpdate[0].endtime).toBe("2023-12-01T22:00:00Z");

    expect(payload.eventsToCreate).toHaveLength(1);
    expect(payload.eventsToCreate[0].starttime).toBe("2023-12-02T20:00:00Z");
    expect(payload.eventsToCreate[0].linkLocationId).toBe(11);
    expect(payload.eventsToCreate[0].pricesToCreate[0].price).toBe(10);
  });

  it("throws error if no events remain", () => {
    const { draft, extractPayload } = useProductionEvents();
    draft.value = [];
    expect(() => extractPayload()).toThrow(
      "A production must contain at least one event",
    );
  });
});

/* eslint-disable jest/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useProductionSeries } from "../../../../app/composables/productions/steps/productionSeries";
import * as useSeriesApiModule from "../../../../app/composables/useSeriesApi";

vi.mock("../../../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

interface MockSeriesParams {
  languageFilters: { lang: string };
}

describe("useProductionSeries", () => {
  const mockApi = {
    getAll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(mockApi);
    vi.useFakeTimers();
  });

  it("initializes with empty draft in create mode", async () => {
    const { draft, original, initialize } = useProductionSeries();
    await initialize({ mode: "create" });

    expect(original.value).toBeNull();
    expect(draft.value).toEqual([]);
  });

  it("initializes with fetched series in edit mode", async () => {
    const mockDataNl = {
      objects: [{ id: 1, titel: "NL Title", description: "NL Desc" }],
    };
    const mockDataEn = {
      objects: [{ id: 1, titel: "EN Title", description: "EN Desc" }],
    };

    mockApi.getAll.mockImplementation((params: MockSeriesParams) => {
      if (params.languageFilters.lang === "nl")
        return Promise.resolve({ data: mockDataNl });
      return Promise.resolve({ data: mockDataEn });
    });

    const { draft, original, initialize } = useProductionSeries();
    await initialize({ mode: "edit", id: "123" });

    expect(mockApi.getAll).toHaveBeenCalledTimes(2);
    expect(original.value).toHaveLength(1);
    expect(draft.value[0].titel.nl).toBe("NL Title");
    expect(draft.value[0].titel.en).toBe("EN Title");
  });

  it("resets to original state", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, titel: "Orig" }] },
    });

    const { draft, initialize, reset } = useProductionSeries();
    await initialize({ mode: "edit", id: "123" });

    draft.value.push({
      type: "new",
      titel: { nl: "New" },
      description: { nl: "" },
    });
    reset();
    expect(draft.value).toHaveLength(1);
    expect(draft.value[0].titel.nl).toBe("Orig");
  });

  it("identifies changed fields correctly", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, titel: "Orig", description: "D" }] },
    });

    const { draft, initialize, getChangedFields } = useProductionSeries();
    await initialize({ mode: "edit", id: "123" });

    expect(getChangedFields()).toHaveLength(0);

    draft.value[0].titel.nl = "Changed";
    expect(getChangedFields()).toEqual(["edited:Changed"]);

    draft.value.push({
      type: "new",
      titel: { nl: "New Item" },
      description: { nl: "" },
    });
    expect(getChangedFields()).toContain("edited:Changed");
    expect(getChangedFields()).toContain("new:New Item");
  });

  it("extracts payload correctly", async () => {
    mockApi.getAll.mockResolvedValue({
      data: { objects: [{ id: 1, titel: "Orig", description: "D" }] },
    });

    const { draft, initialize, extractPayload } = useProductionSeries();
    await initialize({ mode: "edit", id: "123" });

    // Disconnect Orig
    draft.value.shift();

    // Connect existing 2
    draft.value.push({
      type: "existing",
      id: 2,
      titel: { nl: "Ex 2" },
      description: { nl: "D2" },
    });

    // Create New 3
    draft.value.push({
      type: "new",
      titel: { nl: "New 3" },
      description: { nl: "D3" },
    });

    const payload = extractPayload();
    expect(payload.disconnect).toEqual([1]);
    expect(payload.connect).toEqual([2]);
    expect(payload.create).toHaveLength(1);
    expect(payload.create[0].titel.nl).toBe("New 3");
  });
});

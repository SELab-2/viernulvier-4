/* eslint-disable jest/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useProductionCore } from "../../../../app/composables/productions/steps/productionCore";
import * as useProductionApiModule from "../../../../app/composables/useProductionApi";

vi.mock("../../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

describe("useProductionCore", () => {
  const mockApi = {
    getById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(mockApi);
  });

  it("initializes with empty draft in create mode", async () => {
    const { draft, original, initialize } = useProductionCore();
    await initialize({ mode: "create" });

    expect(original.value).toBeNull();
    expect(draft.value.nl.titel).toBe("");
    expect(draft.value.en.titel).toBe("");
  });

  it("initializes with fetched data in edit mode", async () => {
    const mockDataNl = {
      titel: "NL Title",
      description1: "NL Desc 1",
      description2: "NL Desc 2",
      artist: "Artist",
      tagline: "Tag",
      credits: "Credits",
    };
    const mockDataEn = {
      titel: "EN Title",
      description1: "EN Desc 1",
      description2: "EN Desc 2",
      artist: "Artist",
      tagline: "Tag",
      credits: "Credits",
    };

    mockApi.getById.mockImplementation((id: number, locale: string) => {
      if (locale === "nl") return Promise.resolve({ data: mockDataNl });
      return Promise.resolve({ data: mockDataEn });
    });

    const { draft, original, initialize } = useProductionCore();
    await initialize({ mode: "edit", id: "123" });

    expect(mockApi.getById).toHaveBeenCalledWith(123, "nl");
    expect(mockApi.getById).toHaveBeenCalledWith(123, "en");

    expect(original.value?.nl.titel).toBe("NL Title");
    expect(draft.value.en.titel).toBe("EN Title");
  });

  it("resets to empty draft in create mode", () => {
    const { draft, reset } = useProductionCore();
    draft.value.nl.titel = "Dirty";
    reset();
    expect(draft.value.nl.titel).toBe("");
  });

  it("resets to original data in edit mode", async () => {
    mockApi.getById.mockResolvedValue({ data: { titel: "Original" } });

    const { draft, initialize, reset } = useProductionCore();
    await initialize({ mode: "edit", id: "123" });

    draft.value.nl.titel = "Changed";
    reset();
    expect(draft.value.nl.titel).toBe("Original");
  });

  it("identifies changed fields correctly", async () => {
    mockApi.getById.mockResolvedValue({
      data: { titel: "Orig", description1: "D" },
    });

    const { draft, initialize, getChangedFields } = useProductionCore();
    await initialize({ mode: "edit", id: "123" });

    expect(getChangedFields()).toHaveLength(0);

    draft.value.nl.titel = "New";
    expect(getChangedFields()).toEqual(["nl.titel"]);

    draft.value.en.description1 = "New Desc";
    expect(getChangedFields()).toContain("nl.titel");
    expect(getChangedFields()).toContain("en.description1");
  });

  it("extracts payload correctly", () => {
    const { draft, extractPayload } = useProductionCore();
    draft.value.nl.titel = "Extracted";
    const payload = extractPayload();
    expect(payload.nl.titel).toBe("Extracted");

    // Ensure it's a clone
    payload.nl.titel = "Modified";
    expect(draft.value.nl.titel).toBe("Extracted");
  });
});

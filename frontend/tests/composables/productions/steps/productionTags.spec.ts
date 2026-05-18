/* eslint-disable jest/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useProductionTags } from "../../../../app/composables/productions/steps/productionTags";
import * as useProductionApiModule from "../../../../app/composables/useProductionApi";

vi.mock("../../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

describe("useProductionTags", () => {
  const mockApi = {
    getTags: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(mockApi);
  });

  it("initializes with empty draft in create mode", async () => {
    const { draft, original, initialize } = useProductionTags();
    await initialize({ mode: "create" });

    expect(original.value).toBeNull();
    expect(draft.value).toEqual([]);
  });

  it("initializes with fetched tags in edit mode", async () => {
    mockApi.getTags.mockResolvedValue({
      data: [{ id: 1, tag: "Tag 1" }],
    });

    const { draft, original, initialize } = useProductionTags();
    await initialize({ mode: "edit", id: "123" });

    expect(mockApi.getTags).toHaveBeenCalledWith(123, "nl");
    expect(original.value).toHaveLength(1);
    expect(draft.value[0].label).toBe("Tag 1");
  });

  it("resets to original state", async () => {
    mockApi.getTags.mockResolvedValue({
      data: [{ id: 1, label: "T1", type: "existing" }],
    });
    // Wait, the API returns { id, tag }
    mockApi.getTags.mockResolvedValue({ data: [{ id: 1, tag: "T1" }] });

    const { draft, initialize, reset } = useProductionTags();
    await initialize({ mode: "edit", id: "123" });

    draft.value.push({ type: "new", label: "New" });
    reset();
    expect(draft.value).toHaveLength(1);
    expect(draft.value[0].label).toBe("T1");
  });

  it("identifies changed fields correctly", async () => {
    mockApi.getTags.mockResolvedValue({ data: [{ id: 1, tag: "T1" }] });

    const { draft, initialize, getChangedFields } = useProductionTags();
    await initialize({ mode: "edit", id: "123" });

    expect(getChangedFields()).toHaveLength(0);

    draft.value.push({ type: "new", label: "T2" });
    expect(getChangedFields()).toEqual(["new:T2"]);

    draft.value.shift(); // remove T1
    expect(getChangedFields()).toContain("new:T2");
    expect(getChangedFields()).toContain("unselected:T1");
  });

  it("extracts payload correctly", async () => {
    mockApi.getTags.mockResolvedValue({ data: [{ id: 1, tag: "T1" }] });

    const { draft, initialize, extractPayload } = useProductionTags();
    await initialize({ mode: "edit", id: "123" });

    draft.value.shift(); // disconnect T1
    draft.value.push({ type: "existing", id: 2, label: "T2" }); // connect T2
    draft.value.push({ type: "new", label: "T3" }); // create T3

    const payload = extractPayload();
    expect(payload.disconnect).toEqual([1]);
    expect(payload.connect).toEqual([2]);
    expect(payload.create).toEqual(["T3"]);
  });
});

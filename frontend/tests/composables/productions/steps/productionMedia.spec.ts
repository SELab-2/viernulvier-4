/* eslint-disable jest/unbound-method */
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { useProductionMedia } from "../../../../app/composables/productions/steps/productionMedia";
import type {
  NewMediaItemDraft,
  MediaItemDraft,
} from "../../../../app/composables/productions/steps/productionMedia";
import * as useProductionApiModule from "../../../../app/composables/useProductionApi";

vi.mock("../../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));

interface MockMediaItem {
  kind: string;
  crops: Record<
    string,
    { type: string; existingId?: number; existingUrl?: string; file?: File }
  >;
  nl: { title: string };
  en: { title: string };
  deleted?: boolean;
}

describe("useProductionMedia", () => {
  const mockApi = {
    getMediaGallery: vi.fn(),
    getPrintsGallery: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(mockApi);
  });

  it("initializes with empty draft in create mode", async () => {
    const { draft, original, initialize } = useProductionMedia();
    await initialize({ mode: "create" });

    expect(original.value).toBeNull();
    expect(draft.value.items).toHaveLength(0);
  });

  it("initializes with fetched media in edit mode", async () => {
    const mockGallery = {
      id: 10,
      items: [
        {
          id: 100,
          position: "main",
          crops: { hd_ready: { id: 1000, url: "test.jpg" } },
          title: { nl: "T1" },
          description: { nl: "D1" },
          credits: { nl: "C1" },
        },
      ],
    };
    mockApi.getMediaGallery.mockResolvedValue(mockGallery);
    mockApi.getPrintsGallery.mockResolvedValue({ id: 20, items: [] });

    const { draft, original, initialize } = useProductionMedia();
    await initialize({ mode: "edit", id: "123" });

    expect(mockApi.getMediaGallery).toHaveBeenCalled();
    expect(original.value?.galleryId).toBe(10);
    expect(draft.value.items).toHaveLength(1);
    expect(draft.value.items[0].kind).toBe("existing");

    const firstItem = draft.value.items[0] as unknown as MockMediaItem;
    expect(firstItem.crops.hd_ready.type).toBe("existing");
  });

  it("identifies changed fields correctly", async () => {
    const mockGallery = {
      id: 10,
      items: [
        {
          id: 100,
          position: "main",
          crops: { hd_ready: { id: 1000, url: "test.jpg" } },
          title: { nl: "T1" },
          description: { nl: "D1" },
          credits: { nl: "C1" },
        },
      ],
    };
    mockApi.getMediaGallery.mockResolvedValue(mockGallery);
    mockApi.getPrintsGallery.mockResolvedValue({ id: 20, items: [] });

    const { draft, initialize, getChangedFields } = useProductionMedia();
    await initialize({ mode: "edit", id: "123" });

    expect(getChangedFields()).toHaveLength(0);

    const firstItem = draft.value.items[0] as unknown as MockMediaItem;
    if (firstItem.kind === "existing" && !firstItem.deleted) {
      firstItem.nl.title = "New Title";
      expect(getChangedFields()).toEqual(["100:nl.title"]);

      firstItem.crops.hd_ready = { type: "empty" };
      expect(getChangedFields()).toContain("100:removed:hd_ready");
    }
  });

  it("extracts payload correctly", async () => {
    const mockGallery = {
      id: 10,
      items: [
        {
          id: 100,
          position: "main",
          crops: { hd_ready: { id: 1000, url: "test.jpg" } },
          title: { nl: "T1", en: "" },
          description: { nl: "D1", en: "" },
          credits: { nl: "C1", en: "" },
        },
      ],
    };
    mockApi.getMediaGallery.mockResolvedValue(mockGallery);
    mockApi.getPrintsGallery.mockResolvedValue({ id: 20, items: [] });

    const { draft, initialize, extractPayload } = useProductionMedia();
    await initialize({ mode: "edit", id: "123" });

    // Update existing item
    const firstItem = draft.value.items[0] as unknown as MockMediaItem;
    if (firstItem.kind === "existing" && !firstItem.deleted) {
      firstItem.nl.title = "Updated";
      firstItem.crops.hd_ready = {
        type: "replaced",
        existingId: 1000,
        existingUrl: "test.jpg",
        file: new File([], "new.jpg"),
      };
    }

    // Add new item
    const newItem: NewMediaItemDraft = {
      kind: "new" as const,
      position: "carousel" as const,
      nl: { title: "New", description: "Desc", credits: "Cred" },
      en: { title: "", description: "", credits: "" },
      crops: {
        hd_ready: { type: "new" as const, file: new File([], "test2.jpg") },
        hd_ready_square: { type: "empty" as const },
        hd_ready_portrait: { type: "empty" as const },
        FE3_header: { type: "empty" as const },
        FE3_2by1: { type: "empty" as const },
        FE3_grid: { type: "empty" as const },
      },
    };
    draft.value.items.push(newItem as MediaItemDraft);

    const payload = extractPayload();
    expect(payload.itemsToUpdate).toHaveLength(1);
    expect(payload.itemsToUpdate[0].nl.title).toBe("Updated");
    expect(payload.itemsToUpdate[0].cropsToReplace).toHaveLength(1);

    expect(payload.itemsToCreate).toHaveLength(1);
    expect(payload.itemsToCreate[0].nl.title).toBe("New");
  });
});

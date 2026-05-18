import type { ProductionFormStep } from "~/types/ProductionFormStep";
import type { CropName, PrintItemView } from "@repo/common";
import { CROP_NAMES } from "@repo/common";

// ─── Draft types (what the UI works with) ─────────────────────────────────────

export type DraftCrop =
  | { type: "empty" }
  | { type: "existing"; id: number; url: string }
  | { type: "new"; file: File }
  | { type: "replaced"; existingId: number; existingUrl: string; file: File };

export type MediaItemTranslation = {
  title: string;
  description: string;
  credits: string;
};

export type MediaItemDraft =
  | {
      kind: "existing";
      id: number;
      position: "main" | "carousel";
      nl: MediaItemTranslation;
      en: MediaItemTranslation;
      crops: Record<CropName, DraftCrop>;
      deleted: false;
    }
  | {
      kind: "existing";
      id: number;
      position: "main" | "carousel";
      deleted: true;
    }
  | {
      kind: "new";
      position: "main" | "carousel";
      nl: MediaItemTranslation;
      en: MediaItemTranslation;
      crops: Record<CropName, DraftCrop>;
    };

export type ProductionMediaForm = {
  galleryId: number | null;
  items: MediaItemDraft[];
  printGalleryId: number | null;
  prints: PrintItemView[];
};

// ─── Payload types (what finish works with) ───────────────────────────────────

export type CropUpload = { cropName: CropName; file: File };
export type CropReplace = {
  cropName: CropName;
  existingId: number;
  existingUrl: string;
  file: File;
};
export type CropDelete = { cropId: number; url: string };

export type ItemCreate = {
  position: "main" | "carousel";
  nl: MediaItemTranslation;
  en: MediaItemTranslation;
  cropsToUpload: CropUpload[];
};

export type ItemUpdate = {
  id: number;
  nl: MediaItemTranslation;
  en: MediaItemTranslation;
  cropsToUpload: CropUpload[];
  cropsToReplace: CropReplace[];
  cropsToDelete: CropDelete[];
};

export type ItemDelete = {
  id: number;
  cropsToDelete: CropDelete[];
};

export type ProductionMediaPayload = {
  galleryId: number | null;
  itemsToCreate: ItemCreate[];
  itemsToUpdate: ItemUpdate[];
  itemsToDelete: ItemDelete[];
  printGalleryId: number | null;
  printsToLink: number[];
  printsToUnlink: number[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyTranslation(): MediaItemTranslation {
  return { title: "", description: "", credits: "" };
}

function emptyCrops(): Record<CropName, DraftCrop> {
  return Object.fromEntries(
    CROP_NAMES.map((name) => [name, { type: "empty" }]),
  ) as Record<CropName, DraftCrop>;
}

function cloneCrops(
  crops: Record<CropName, DraftCrop>,
): Record<CropName, DraftCrop> {
  return Object.fromEntries(
    CROP_NAMES.map((name) => {
      const crop = crops[name];
      // Files can't be cloned — new/replaced uploads are dropped on reset
      if (crop.type === "existing") return [name, { ...crop }];
      return [name, { type: "empty" }];
    }),
  ) as Record<CropName, DraftCrop>;
}

export function newItemDraft(position: "main" | "carousel"): MediaItemDraft {
  return {
    kind: "new",
    position,
    nl: emptyTranslation(),
    en: emptyTranslation(),
    crops: emptyCrops(),
  };
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useProductionMedia(): ProductionFormStep<
  ProductionMediaForm,
  ProductionMediaForm,
  ProductionMediaPayload
> {
  const productionApi = useProductionApi();

  const draft = ref<ProductionMediaForm>({
    galleryId: null,
    items: [],
    printGalleryId: null,
    prints: [],
  });
  const original = ref<ProductionMediaForm | null>(null);

  // ─── Initialize ─────────────────────────────────────────────────────────────

  async function initialize(context: {
    mode: "create" | "edit";
    id?: string;
  }): Promise<void> {
    if (context.mode === "create") {
      original.value = null;
      draft.value = {
        galleryId: null,
        items: [],
        printGalleryId: null,
        prints: [],
      };
      return;
    }

    if (!context.id) return;

    const productionId = Number(context.id);
    const [gallery, printGallery] = await Promise.all([
      productionApi.getMediaGallery(productionId),
      productionApi.getPrintsGallery(productionId, "nl"), // Using NL to get PrintItemView
    ]);

    const items: MediaItemDraft[] =
      gallery?.items.map((item) => {
        const crops = emptyCrops();

        for (const [cropName, crop] of Object.entries(item.crops)) {
          if (crop) {
            crops[cropName as CropName] = {
              type: "existing",
              id: crop.id,
              url: crop.url,
            };
          }
        }

        const title = item.title as { nl?: string; en?: string } | null;
        const description = item.description as {
          nl?: string;
          en?: string;
        } | null;
        const credits = item.credits as { nl?: string; en?: string } | null;

        return {
          kind: "existing",
          id: item.id,
          position: item.position,
          deleted: false,
          nl: {
            title: title?.nl ?? "",
            description: description?.nl ?? "",
            credits: credits?.nl ?? "",
          },
          en: {
            title: title?.en ?? "",
            description: description?.en ?? "",
            credits: credits?.en ?? "",
          },
          crops,
        };
      }) ?? [];

    const prints = (printGallery?.items as PrintItemView[]) ?? [];

    original.value = {
      galleryId: gallery?.id ?? null,
      items,
      printGalleryId: printGallery?.id ?? null,
      prints,
    };
    draft.value = {
      galleryId: gallery?.id ?? null,
      items: items.map((item) => {
        if (item.kind === "existing" && !item.deleted) {
          return {
            ...item,
            nl: { ...item.nl },
            en: { ...item.en },
            crops: cloneCrops(item.crops),
          };
        }
        return { ...item };
      }),
      printGalleryId: printGallery?.id ?? null,
      prints: [...prints],
    };
  }

  // ─── Reset ──────────────────────────────────────────────────────────────────

  function reset(): void {
    if (!original.value) {
      draft.value = {
        galleryId: null,
        items: [],
        printGalleryId: null,
        prints: [],
      };
      return;
    }

    draft.value = {
      galleryId: original.value.galleryId,
      items: original.value.items.map((item) => {
        if (item.kind === "existing" && !item.deleted) {
          return {
            ...item,
            nl: { ...item.nl },
            en: { ...item.en },
            crops: cloneCrops(item.crops),
          };
        }
        return { ...item };
      }),
      printGalleryId: original.value.printGalleryId,
      prints: [...original.value.prints],
    };
  }

  // ─── Changed fields ──────────────────────────────────────────────────────────

  function getChangedFields(): string[] {
    if (!original.value) {
      return [
        ...draft.value.items.map((_, i) => `item[${i}]`),
        ...draft.value.prints.map((p) => `print:${p.id}`),
      ];
    }

    const changes: string[] = [];

    // Media items changes
    for (const item of draft.value.items) {
      if (item.kind === "new") {
        changes.push(`new:${item.position}`);
        continue;
      }

      if (item.deleted) {
        changes.push(`deleted:${item.id}`);
        continue;
      }

      const orig = original.value.items.find(
        (o) => o.kind === "existing" && o.id === item.id,
      );
      if (!orig || orig.kind !== "existing" || orig.deleted) continue;

      for (const locale of ["nl", "en"] as const) {
        for (const field of ["title", "description", "credits"] as const) {
          if (item[locale][field] !== orig[locale][field]) {
            changes.push(`${item.id}:${locale}.${field}`);
          }
        }
      }

      for (const cropName of CROP_NAMES) {
        const crop = item.crops[cropName];
        if (crop.type === "new") changes.push(`${item.id}:upload:${cropName}`);
        if (crop.type === "replaced")
          changes.push(`${item.id}:replace:${cropName}`);
        if (crop.type === "empty" && orig.crops[cropName].type === "existing") {
          changes.push(`${item.id}:removed:${cropName}`);
        }
      }
    }

    // Prints changes
    const origPrintIds = new Set(original.value.prints.map((p) => p.id));
    const draftPrintIds = new Set(draft.value.prints.map((p) => p.id));

    for (const p of draft.value.prints) {
      if (!origPrintIds.has(p.id)) {
        changes.push(`print:link:${p.id}`);
      }
    }
    for (const p of original.value.prints) {
      if (!draftPrintIds.has(p.id)) {
        changes.push(`print:unlink:${p.id}`);
      }
    }

    return changes;
  }

  // ─── Extract payload ─────────────────────────────────────────────────────────

  function extractPayload(): ProductionMediaPayload {
    const itemsToCreate: ItemCreate[] = [];
    const itemsToUpdate: ItemUpdate[] = [];
    const itemsToDelete: ItemDelete[] = [];

    for (const item of draft.value.items) {
      if (item.kind === "existing" && item.deleted) {
        // Collect all existing crops so finish can clean up storage
        const orig = original.value?.items.find(
          (o) => o.kind === "existing" && o.id === item.id,
        );
        const cropsToDelete: CropDelete[] = [];
        if (orig && orig.kind === "existing" && !orig.deleted) {
          for (const cropName of CROP_NAMES) {
            const crop = orig.crops[cropName];
            if (crop.type === "existing") {
              cropsToDelete.push({ cropId: crop.id, url: crop.url });
            }
          }
        }
        itemsToDelete.push({ id: item.id, cropsToDelete });
        continue;
      }

      if (item.kind === "new") {
        const cropsToUpload: CropUpload[] = [];
        for (const cropName of CROP_NAMES) {
          const crop = item.crops[cropName];
          if (crop.type === "new") {
            cropsToUpload.push({ cropName, file: crop.file });
          }
        }
        // Only persist if Dutch text + at least one crop
        const hasText =
          item.nl.title.trim() !== "" &&
          item.nl.description.trim() !== "" &&
          item.nl.credits.trim() !== "";
        if (hasText && cropsToUpload.length > 0) {
          itemsToCreate.push({
            position: item.position,
            nl: item.nl,
            en: item.en,
            cropsToUpload,
          });
        }
        continue;
      }

      // Existing, not deleted
      const cropsToUpload: CropUpload[] = [];
      const cropsToReplace: CropReplace[] = [];
      const cropsToDelete: CropDelete[] = [];

      for (const cropName of CROP_NAMES) {
        const crop = item.crops[cropName];
        if (crop.type === "new") {
          cropsToUpload.push({ cropName, file: crop.file });
        } else if (crop.type === "replaced") {
          cropsToReplace.push({
            cropName,
            existingId: crop.existingId,
            existingUrl: crop.existingUrl,
            file: crop.file,
          });
        } else if (crop.type === "empty") {
          const orig = original.value?.items.find(
            (o) => o.kind === "existing" && o.id === item.id,
          );
          if (orig && orig.kind === "existing" && !orig.deleted) {
            const origCrop = orig.crops[cropName];
            if (origCrop.type === "existing") {
              cropsToDelete.push({ cropId: origCrop.id, url: origCrop.url });
            }
          }
        }
      }

      itemsToUpdate.push({
        id: item.id,
        nl: item.nl,
        en: item.en,
        cropsToUpload,
        cropsToReplace,
        cropsToDelete,
      });
    }

    const origPrintIds = new Set(original.value?.prints.map((p) => p.id) ?? []);
    const draftPrintIds = new Set(draft.value.prints.map((p) => p.id));

    const printsToLink = draft.value.prints
      .filter((p) => !origPrintIds.has(p.id))
      .map((p) => p.id);
    const printsToUnlink = (original.value?.prints ?? [])
      .filter((p) => !draftPrintIds.has(p.id))
      .map((p) => p.id);

    return {
      galleryId: draft.value.galleryId,
      itemsToCreate,
      itemsToUpdate,
      itemsToDelete,
      printGalleryId: draft.value.printGalleryId,
      printsToLink,
      printsToUnlink,
    };
  }

  return {
    id: "media",
    draft,
    original,
    initialize,
    reset,
    getChangedFields,
    extractPayload,
  };
}

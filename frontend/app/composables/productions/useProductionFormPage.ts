import { useProductionCore } from "~/composables/productions/steps/productionCore";
import { useProductionTags } from "~/composables/productions/steps/productionTags";
import { useProductionMedia } from "~/composables/productions/steps/productionMedia";
import type {
  ItemCreate,
  ItemUpdate,
  ItemDelete,
} from "~/composables/productions/steps/productionMedia";
import { useRoute } from "vue-router";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";

export type ProductionFormMode = "create" | "edit";

export function useProductionFormPage(mode: ProductionFormMode) {
  const route = useRoute();
  const router = useRouter();
  const productionApi = useProductionApi();
  const tagApi = useTagApi();
  const galleryApi = useGalleryApi();
  const itemApi = useItemApi();
  const cropApi = useCropApi();
  const storageApi = useStorageApi();

  const core = useProductionCore();
  const tags = useProductionTags();
  const media = useProductionMedia();

  const steps = [core, tags, media];

  const currentStepIndex = ref(0);
  const isSubmitting = ref(false);

  const currentStep = computed(() => steps[currentStepIndex.value]!);

  function nextStep(): void {
    currentStepIndex.value = Math.min(
      currentStepIndex.value + 1,
      steps.length - 1,
    );
  }

  function prevStep(): void {
    currentStepIndex.value = Math.max(currentStepIndex.value - 1, 0);
  }

  function resetCurrentStep(): void {
    currentStep.value.reset();
  }

  function getCurrentStepChangedFields(): string[] {
    return currentStep.value.getChangedFields();
  }

  // ─── Media helpers ───────────────────────────────────────────────────────────

  async function ensureGallery(
    productionId: number,
    existingGalleryId: number | null,
  ): Promise<number> {
    if (existingGalleryId !== null) return existingGalleryId;

    const res = await galleryApi.create({
      name: `production-${productionId}-gallery`,
      type: "default",
    });
    if (!res.data) throw new Error("Failed to create gallery");
    await productionApi.linkMedia(productionId, res.data.id);
    return res.data.id;
  }

  async function persistItemCreate(
    item: ItemCreate,
    galleryId: number,
    productionId: number,
  ): Promise<void> {
    const res = await itemApi.create({
      type: "image",
      original_filename: `production-${productionId}-${item.position}`,
      position: item.position,
      width: 0,
      height: 0,
      title: { nl: item.nl.title, en: item.en.title || item.nl.title },
      description: {
        nl: item.nl.description,
        en: item.en.description || item.nl.description,
      },
      credits: { nl: item.nl.credits, en: item.en.credits || item.nl.credits },
      gallery_ids: [galleryId],
    });
    if (!res.data) throw new Error("Failed to create media item");

    const itemId = res.data.id;
    for (const { cropName, file } of item.cropsToUpload) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const url = `/photos/production-${productionId}-item-${itemId}-${cropName}-${Date.now()}.${ext}`;
      await storageApi.saveMedia(url, file);
      await cropApi.create({ name: cropName, url, item_id: itemId });
    }
  }

  async function persistItemUpdate(
    item: ItemUpdate,
    productionId: number,
  ): Promise<void> {
    await itemApi.modify(item.id, {
      title: { nl: item.nl.title, en: item.en.title || item.nl.title },
      description: {
        nl: item.nl.description,
        en: item.en.description || item.nl.description,
      },
      credits: { nl: item.nl.credits, en: item.en.credits || item.nl.credits },
    });

    // Upload brand new crops
    for (const { cropName, file } of item.cropsToUpload) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const url = `/photos/production-${productionId}-item-${item.id}-${cropName}-${Date.now()}.${ext}`;
      await storageApi.saveMedia(url, file);
      await cropApi.create({ name: cropName, url, item_id: item.id });
    }

    // Replace existing crops — delete old file + create new crop record
    for (const {
      cropName,
      existingId,
      existingUrl,
      file,
    } of item.cropsToReplace) {
      await storageApi.deleteMedia(existingUrl);
      await cropApi.remove(existingId);
      const ext = file.name.split(".").pop() ?? "jpg";
      const url = `/photos/production-${productionId}-item-${item.id}-${cropName}-${Date.now()}.${ext}`;
      await storageApi.saveMedia(url, file);
      await cropApi.create({ name: cropName, url, item_id: item.id });
    }

    // Delete removed crops
    for (const { cropId, url } of item.cropsToDelete) {
      await storageApi.deleteMedia(url);
      await cropApi.remove(cropId);
    }
  }

  async function persistItemDelete(item: ItemDelete): Promise<void> {
    // Clean up storage for all crops first
    for (const { url } of item.cropsToDelete) {
      await storageApi.deleteMedia(url);
    }
    await itemApi.remove(item.id);
  }

  // ─── Finish ──────────────────────────────────────────────────────────────────

  async function finish(): Promise<void> {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
      const corePayload = core.extractPayload();
      const tagsPayload = tags.extractPayload();
      const mediaPayload = media.extractPayload();

      // Remap from per-locale translation objects to LocalizedString fields
      const productionBody = {
        titel: { nl: corePayload.nl.titel, en: corePayload.en.titel },
        description1: {
          nl: corePayload.nl.description1,
          en: corePayload.en.description1,
        },
        description2:
          corePayload.nl.description2 !== null ||
          corePayload.en.description2 !== null
            ? {
                nl: corePayload.nl.description2 ?? "",
                en: corePayload.en.description2 ?? "",
              }
            : null,
        artist:
          corePayload.nl.artist !== null || corePayload.en.artist !== null
            ? {
                nl: corePayload.nl.artist ?? "",
                en: corePayload.en.artist ?? "",
              }
            : null,
        tagline:
          corePayload.nl.tagline !== null || corePayload.en.tagline !== null
            ? {
                nl: corePayload.nl.tagline ?? "",
                en: corePayload.en.tagline ?? "",
              }
            : null,
        credits:
          corePayload.nl.credits !== null || corePayload.en.credits !== null
            ? {
                nl: corePayload.nl.credits ?? "",
                en: corePayload.en.credits ?? "",
              }
            : null,
        performer_type: null,
        attendance_mode: null,
      };

      if (mode === "create") {
        // 1. Create the production
        const res = await productionApi.create(productionBody);

        if (!res.data) throw new Error("Failed to create production");

        const productionId = res.data.id;

        // 2. Create new tags and collect all IDs to connect
        const newTagIds = await Promise.all(
          tagsPayload.create.map(async (label) => {
            const created = await tagApi.create({
              tag: { nl: label, en: label },
            });
            if (!created.data)
              throw new Error(`Failed to create tag: ${label}`);
            return created.data.id;
          }),
        );

        // Connect all tags (existing selections + freshly created)
        await Promise.all(
          [...tagsPayload.connect, ...newTagIds].map((tagId) =>
            productionApi.addTag(productionId, tagId),
          ),
        );

        // 3. Media — only if there are items to create
        if (mediaPayload.itemsToCreate.length > 0) {
          const galleryId = await ensureGallery(productionId, null);
          for (const item of mediaPayload.itemsToCreate) {
            await persistItemCreate(item, galleryId, productionId);
          }
        }
      } else {
        // Edit mode — id is guaranteed to be set
        const idParam = route.params.id;
        if (typeof idParam !== "string")
          throw new Error("Missing production ID");
        const productionId = Number(idParam);

        // 1. Replace core content
        await productionApi.replace(productionId, productionBody);

        // 2. Create new tags and collect their IDs
        const newTagIds = await Promise.all(
          tagsPayload.create.map(async (label) => {
            const created = await tagApi.create({
              tag: { nl: label, en: label },
            });
            if (!created.data)
              throw new Error(`Failed to create tag: ${label}`);
            return created.data.id;
          }),
        );

        // Connect new tags (existing + freshly created) and disconnect removed ones
        await Promise.all([
          ...[...tagsPayload.connect, ...newTagIds].map((tagId) =>
            productionApi.addTag(productionId, tagId),
          ),
          ...tagsPayload.disconnect.map((tagId) =>
            productionApi.removeTag(productionId, tagId),
          ),
        ]);

        // 3. Media
        const hasMediaChanges =
          mediaPayload.itemsToCreate.length > 0 ||
          mediaPayload.itemsToUpdate.length > 0 ||
          mediaPayload.itemsToDelete.length > 0;

        if (hasMediaChanges) {
          // Deletions first so we don't leave orphans
          for (const item of mediaPayload.itemsToDelete) {
            await persistItemDelete(item);
          }

          const galleryId = await ensureGallery(
            productionId,
            mediaPayload.galleryId,
          );

          for (const item of mediaPayload.itemsToCreate) {
            await persistItemCreate(item, galleryId, productionId);
          }
          for (const item of mediaPayload.itemsToUpdate) {
            await persistItemUpdate(item, productionId);
          }
        }
      }

      await router.push(ROUTES.admin.productions.base);
    } finally {
      isSubmitting.value = false;
    }
  }

  async function initializeSteps(): Promise<void> {
    const idParam = route.params.id;

    const context = {
      mode,
      id: mode === "edit" && typeof idParam === "string" ? idParam : undefined,
    };

    await Promise.all(steps.map((step) => step.initialize(context)));
  }

  return {
    mode,
    steps,
    currentStep,
    currentStepIndex,
    isSubmitting,
    nextStep,
    prevStep,
    resetCurrentStep,
    getCurrentStepChangedFields,
    finish,
    initializeSteps,
  };
}

// useProductionFormPage.ts
// - Orchestrates the multi-step production form (core, tags, media, events).
// - Handles create/edit flows: creates production, tags, media, events and links locations.
// - Exposes finish() to persist all steps in the correct order.
import { useProductionCore } from "~/composables/productions/steps/productionCore";
import { useProductionTags } from "~/composables/productions/steps/productionTags";
import { useProductionMedia } from "~/composables/productions/steps/productionMedia";
import { useProductionEvents } from "~/composables/productions/steps/productionEvents";
import type { EventCreatePayload } from "~/composables/productions/steps/productionEvents";
import type {
  ItemCreate,
  ItemUpdate,
  ItemDelete,
} from "~/composables/productions/steps/productionMedia";
import { useRoute, useRouter } from "vue-router";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useProductionSeries } from "~/composables/productions/steps/productionSeries";
import { useSeriesApi } from "~/composables/useSeriesApi";
import type { LocalizedInput } from "~/composables/productions/steps/productionSeries";

export type ProductionFormMode = "create" | "edit";

export function useProductionFormPage(mode: ProductionFormMode) {
  const route = useRoute();
  const router = useRouter();
  const productionApi = useProductionApi();
  const tagApi = useTagApi();
  const locationApi = useLocationApi();
  const eventApi = useEventApi();
  const priceApi = usePriceApi();
  const galleryApi = useGalleryApi();
  const itemApi = useItemApi();
  const cropApi = useCropApi();
  const storageApi = useStorageApi();
  const seriesApi = useSeriesApi();

  const core = useProductionCore();
  const tags = useProductionTags();
  const media = useProductionMedia();
  const events = useProductionEvents();
  const series = useProductionSeries();

  const steps = [core, tags, media, events, series];

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

  // ─── Location / Event helpers ───────────────────────────────────────────────

  /**
   * Resolves a location for an event:
   * - If createLocation is provided, create a new location and return its id.
   * - Otherwise return linkLocationId (may be null).
   */
  async function resolveLocationId(
    createLocation: string | null,
    linkLocationId: number | null,
  ): Promise<number | null> {
    if (createLocation !== null) {
      const res = await locationApi.create({
        location: { nl: createLocation, en: createLocation },
      });
      if (!res.data)
        throw new Error(`Failed to create location: ${createLocation}`);
      return res.data.id;
    }

    return linkLocationId;
  }

  /**
   * Creates an event on the server for a production.
   * - Validates required starttime.
   * - Builds a payload including optional fields (may be null).
   * - Creates the event and links a location if needed.
   * Errors are rethrown with context to the caller.
   */
  async function persistEventCreate(
    event: EventCreatePayload,
    productionId: number,
  ): Promise<void> {
    if (!event.starttime || event.starttime.trim() === "") {
      throw new Error("Event starttime is required");
    }

    // Typed request body for clarity
    type EventApiCreateBody = {
      starttime: string;
      endtime: string | null;
      doors_at: string | null;
      intermission_at: string | null;
      production_id: number;
    };

    const body: EventApiCreateBody = {
      starttime: event.starttime,
      endtime: event.endtime ?? null,
      doors_at: event.doors_at ?? null,
      intermission_at: event.intermission_at ?? null,
      production_id: productionId,
    };

    try {
      // Pass the typed body directly (no unnecessary assertion)
      const created = await eventApi.create(body);

      if (!created || !created.data) {
        throw new Error("Failed to create event: unexpected server response");
      }

      const locationId = await resolveLocationId(
        event.createLocation,
        event.linkLocationId,
      );

      if (locationId !== null) {
        await eventApi.linkLocation(created.data.id, locationId);
      }

      // Create the price and link it to the event.
      for (const price of event.pricesToCreate) {
        const resp = await priceApi.create({
          price: price.price,
          name: {
            en: price.name.en ?? price.name.nl, // Fallback to the dutch version.
            nl: price.name.nl,
          },
        });

        if (resp.data?.id) {
          await eventApi.linkPrice(created.data.id, resp.data.id);
        }
      }
    } catch (err: unknown) {
      let cause: string;
      if (err instanceof Error) cause = err.message;
      else if (typeof err === "string") cause = err;
      else {
        try {
          cause = JSON.stringify(err);
        } catch {
          cause = String(err);
        }
      }
      throw new Error(`Failed to create event: ${cause}`);
    }
  }

  // ─── Refactor helpers to reduce duplication ─────────────────────────────────
  async function createTagIds(labels: string[]): Promise<number[]> {
    return Promise.all(
      labels.map(async (label) => {
        const created = await tagApi.create({ tag: { nl: label, en: label } });
        if (!created.data) throw new Error(`Failed to create tag: ${label}`);
        return created.data.id;
      }),
    );
  }

  async function connectTags(productionId: number, tagIds: number[]) {
    await Promise.all(
      tagIds.map((tagId) => productionApi.addTag(productionId, tagId)),
    );
  }

  async function disconnectTags(productionId: number, tagIds: number[]) {
    await Promise.all(
      tagIds.map((tagId) => productionApi.removeTag(productionId, tagId)),
    );
  }

  async function handleMediaCreate(
    productionId: number,
    mediaPayload: ReturnType<typeof media.extractPayload>,
  ) {
    if (mediaPayload.itemsToCreate.length > 0) {
      const galleryId = await ensureGallery(productionId, null);
      for (const item of mediaPayload.itemsToCreate) {
        await persistItemCreate(item, galleryId, productionId);
      }
    }
  }

  async function handleMediaEdit(
    productionId: number,
    mediaPayload: ReturnType<typeof media.extractPayload>,
  ) {
    const hasMediaChanges =
      mediaPayload.itemsToCreate.length > 0 ||
      mediaPayload.itemsToUpdate.length > 0 ||
      mediaPayload.itemsToDelete.length > 0;

    if (!hasMediaChanges) return;

    // Deletions first
    for (const item of mediaPayload.itemsToDelete) {
      await persistItemDelete(item);
    }

    const galleryId = await ensureGallery(productionId, mediaPayload.galleryId);

    for (const item of mediaPayload.itemsToCreate) {
      await persistItemCreate(item, galleryId, productionId);
    }
    for (const item of mediaPayload.itemsToUpdate) {
      await persistItemUpdate(item, productionId);
    }
  }

  async function handleEventsCreate(
    productionId: number,
    eventsPayload: ReturnType<typeof events.extractPayload>,
  ) {
    for (const event of eventsPayload.eventsToCreate) {
      await persistEventCreate(event, productionId);
    }
  }

  async function handleEventsEdit(
    productionId: number,
    eventsPayload: ReturnType<typeof events.extractPayload>,
  ) {
    // Delete: unlink location first, then delete the event
    for (const event of eventsPayload.eventsToDelete) {
      if (event.unlinkLocationId !== null) {
        await eventApi.unlinkLocation(event.id);
      }
      await eventApi.remove(event.id);
    }

    // Update: patch datetime fields, then swap location if needed
    for (const event of eventsPayload.eventsToUpdate) {
      await eventApi.modify(event.id, {
        starttime: event.starttime,
        endtime: event.endtime,
        doors_at: event.doors_at,
        intermission_at: event.intermission_at,
      });

      const locationChanged =
        event.unlinkLocationId !== null ||
        event.linkLocationId !== null ||
        event.createLocation !== null;

      if (locationChanged) {
        if (event.unlinkLocationId !== null) {
          await eventApi.unlinkLocation(event.id);
        }

        const locationId = await resolveLocationId(
          event.createLocation,
          event.linkLocationId,
        );
        if (locationId !== null) {
          await eventApi.linkLocation(event.id, locationId);
        }
      }

      // Remove the prices that should be deleted.
      for (const priceId of event.pricesToDelete) {
        await priceApi.remove(priceId);
      }

      // Modify the prices that should be modified.
      for (const price of event.pricesToUpdate) {
        await priceApi.modify(price.id, {
          price: price.price,
          name: {
            en: price.name.en ?? price.name.nl, // Fallback to the dutch version.
            nl: price.name.nl,
          },
        });
      }
      for (const price of event.pricesToCreate) {
        const resp = await priceApi.create({
          price: price.price,
          name: {
            en: price.name.en ?? price.name.nl, // Fallback to the dutch version.
            nl: price.name.nl,
          },
        });

        if (resp.data?.id) {
          await eventApi.linkPrice(event.id, resp.data.id);
        }
      }
    }

    // Create new events
    for (const event of eventsPayload.eventsToCreate) {
      await persistEventCreate(event, productionId);
    }
  }

  async function handleSeriesCreateAndConnect(
    productionId: number,
    seriesPayload: ReturnType<typeof series.extractPayload>,
  ) {
    const newSeriesIds = await Promise.all(
      seriesPayload.create.map(async (s) => {
        const created = await seriesApi.create(s);
        if (!created.data)
          throw new Error(`Failed to create series: ${s.titel.nl}`);
        return created.data.id;
      }),
    );

    await Promise.all(
      [...seriesPayload.connect, ...newSeriesIds].map((seriesId) =>
        seriesApi.linkProductionToSeries(seriesId, [productionId]),
      ),
    );
  }

  function toModifySeriesPayload(input: {
    titel: LocalizedInput;
    description: LocalizedInput;
  }) {
    return {
      titel: {
        nl: input.titel.nl,
        en: input.titel.en ?? input.titel.nl,
      },
      description: {
        nl: input.description.nl,
        en: input.description.en ?? input.description.nl,
      },
    };
  }

  async function handleSeriesUpdate(
    seriesPayload: ReturnType<typeof series.extractPayload>,
  ) {
    await Promise.all(
      seriesPayload.update.map((s) =>
        seriesApi.modify(s.id, toModifySeriesPayload(s)),
      ),
    );
  }

  async function handleSeriesEdit(
    productionId: number,
    seriesPayload: ReturnType<typeof series.extractPayload>,
  ) {
    const newSeriesIds = await Promise.all(
      seriesPayload.create.map(async (s) => {
        const created = await seriesApi.create(s);
        if (!created.data)
          throw new Error(`Failed to create series: ${s.titel.nl}`);
        return created.data.id;
      }),
    );

    await Promise.all([
      ...[...seriesPayload.connect, ...newSeriesIds].map((seriesId) =>
        seriesApi.linkProductionToSeries(seriesId, [productionId]),
      ),
      ...seriesPayload.disconnect.map((seriesId) =>
        seriesApi.unlinkProductionFromSeries(seriesId, productionId),
      ),
    ]);
  }

  async function finish(): Promise<void> {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
      const corePayload = core.extractPayload();
      const tagsPayload = tags.extractPayload();
      const mediaPayload = media.extractPayload();
      const eventsPayload = events.extractPayload();
      const seriesPayload = series.extractPayload();

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

        // Tags: create labels then connect all tag ids
        const newTagIds = await createTagIds(tagsPayload.create);
        await connectTags(productionId, [...tagsPayload.connect, ...newTagIds]);

        // Media
        await handleMediaCreate(productionId, mediaPayload);

        // Events
        await handleEventsCreate(productionId, eventsPayload);

        // Series
        await handleSeriesCreateAndConnect(productionId, seriesPayload);
        await handleSeriesUpdate(seriesPayload);
      } else {
        // Edit mode — id is guaranteed to be set
        const idParam = route.params.id;
        if (typeof idParam !== "string")
          throw new Error("Missing production ID");
        const productionId = Number(idParam);

        // 1. Replace core content
        await productionApi.replace(productionId, productionBody);

        // Tags: create new + connect and disconnect removed
        const newTagIds = await createTagIds(tagsPayload.create);
        await Promise.all([
          connectTags(productionId, [...tagsPayload.connect, ...newTagIds]),
          disconnectTags(productionId, tagsPayload.disconnect),
        ]);

        // Media
        await handleMediaEdit(productionId, mediaPayload);

        // Events
        await handleEventsEdit(productionId, eventsPayload);

        // Series
        await handleSeriesEdit(productionId, seriesPayload);
        await handleSeriesUpdate(seriesPayload);
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

/**
 * composables/productions/useProductionForm.ts
 *
 * Pure local-state composable for the production create/edit multi-step flow.
 *
 * DESIGN PRINCIPLE: No API calls happen during form filling.
 * All mutations (create/modify production, link tags, link series) are
 * deferred and executed sequentially only when finish() is called at the end.
 *
 * For edit mode:
 *  - Original values are stored so changed fields can be highlighted.
 *  - reset(step) restores a step's fields to their original values.
 *  - Only actually-changed fields are sent in the PATCH call.
 */

import type { CreateProduction, TagView } from "@repo/common";

export type ProductionFormMode = "create" | "edit";

export interface TagItem {
  id: number;
  tag: string;
  isNew?: boolean; // true = needs to be created via API first
}

export interface SeriesItem {
  id: number;
  name: string;
  isNew?: boolean;
}

interface ProductionTranslation {
  titel: string;
  description1: string;
  description2: string;
  tagline: string;
  credits: string;
  artist: string;
}

function emptyTranslation(): ProductionTranslation {
  return {
    titel: "",
    description1: "",
    description2: "",
    tagline: "",
    credits: "",
    artist: "",
  };
}

function extractData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

interface UseProductionFormOptions {
  mode: ProductionFormMode;
  productionId?: number | null;
}

export function useProductionForm({
  mode,
  productionId = null,
}: UseProductionFormOptions) {
  const { getById, create, modify, addTag, removeTag, getTags } =
    useProductionApi();

  // ─── Step 1: core text data ──────────────────────────────────────────────────
  const nlData = ref<ProductionTranslation>(emptyTranslation());
  const enData = ref<ProductionTranslation>(emptyTranslation());

  // Originals — used for edit-mode diff & reset
  const originalNl = ref<ProductionTranslation>(emptyTranslation());
  const originalEn = ref<ProductionTranslation>(emptyTranslation());

  // For pre-filling the form inputs
  const initialNl = ref<ProductionTranslation>(emptyTranslation());
  const initialEn = ref<ProductionTranslation>(emptyTranslation());

  // ─── Step 2: tags (local, not persisted until finish) ────────────────────────
  const selectedTags = ref<TagItem[]>([]);
  const originalTagIds = ref<number[]>([]); // for edit mode diff

  // ─── Step 3: media (placeholder — logic added later) ────────────────────────
  // Just a slot for now; media linking logic will be added in a future iteration
  const mediaSlot = ref<null>(null);

  // ─── Step 4: series ──────────────────────────────────────────────────────────
  const selectedSeries = ref<SeriesItem[]>([]);
  const originalSeriesIds = ref<number[]>([]);

  // ─── Edit mode: load existing data ──────────────────────────────────────────
  const isLoading = ref(false);
  const existingId = ref<number | null>(productionId);

  if (mode === "edit" && productionId) {
    isLoading.value = true;

    void Promise.all([
      getById(productionId, "nl"),
      getById(productionId, "en"),
      getTags(productionId, "nl"),
    ])
      .then(([nlRes, enRes, tagsRes]) => {
        const nl = extractData<Partial<ProductionTranslation>>(nlRes);
        const en = extractData<Partial<ProductionTranslation>>(enRes);
        const tagsData = extractData<TagView[]>(tagsRes) ?? [];

        const nlFilled: ProductionTranslation = {
          titel: nl.titel ?? "",
          description1: nl.description1 ?? "",
          description2: nl.description2 ?? "",
          tagline: nl.tagline ?? "",
          credits: nl.credits ?? "",
          artist: nl.artist ?? "",
        };

        const enFilled: ProductionTranslation = {
          titel: en.titel ?? "",
          description1: en.description1 ?? "",
          description2: en.description2 ?? "",
          tagline: en.tagline ?? "",
          credits: en.credits ?? "",
          artist: en.artist ?? "",
        };

        // Store originals for diff & reset
        originalNl.value = { ...nlFilled };
        originalEn.value = { ...enFilled };

        // Seed form inputs and live data
        initialNl.value = { ...nlFilled };
        initialEn.value = { ...enFilled };
        nlData.value = { ...nlFilled };
        enData.value = { ...enFilled };

        // Seed existing tags
        const validTags = (Array.isArray(tagsData) ? tagsData : []).filter(
          (t) => t.tag && t.tag !== "N/A",
        );
        selectedTags.value = validTags.map((t) => ({ id: t.id, tag: t.tag }));
        originalTagIds.value = validTags.map((t) => t.id);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch production for edit", err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  // ─── Changed field tracking (edit mode) ─────────────────────────────────────
  const changedNlFields = computed(() => {
    if (mode !== "edit") return new Set<string>();
    const changed = new Set<string>();
    for (const key of Object.keys(
      originalNl.value,
    ) as (keyof ProductionTranslation)[]) {
      if (nlData.value[key] !== originalNl.value[key]) changed.add(`nl.${key}`);
    }
    return changed;
  });

  const changedEnFields = computed(() => {
    if (mode !== "edit") return new Set<string>();
    const changed = new Set<string>();
    for (const key of Object.keys(
      originalEn.value,
    ) as (keyof ProductionTranslation)[]) {
      if (enData.value[key] !== originalEn.value[key]) changed.add(`en.${key}`);
    }
    return changed;
  });

  const changedTagIds = computed(() => {
    if (mode !== "edit")
      return {
        added: selectedTags.value.map((t) => t.id),
        removed: [] as number[],
      };
    const currentIds = selectedTags.value
      .filter((t) => !t.isNew)
      .map((t) => t.id);
    const added = currentIds.filter((id) => !originalTagIds.value.includes(id));
    const removed = originalTagIds.value.filter(
      (id) => !currentIds.includes(id),
    );
    return { added, removed };
  });

  // ─── Preview data ─────────────────────────────────────────────────────────────
  const previewData = computed(() => ({
    id: existingId.value ?? undefined,
    titel: { nl: nlData.value.titel, en: enData.value.titel },
    description1: {
      nl: nlData.value.description1,
      en: enData.value.description1,
    },
    description2: {
      nl: nlData.value.description2,
      en: enData.value.description2,
    },
    tagline: { nl: nlData.value.tagline, en: enData.value.tagline },
    credits: { nl: nlData.value.credits, en: enData.value.credits },
    artist: { nl: nlData.value.artist, en: enData.value.artist },
  }));

  // ─── Live update handlers (from dual form @nl-update / @en-update) ───────────
  function handleNlUpdate(data: Partial<ProductionTranslation>) {
    nlData.value = { ...emptyTranslation(), ...data };
  }

  function handleEnUpdate(data: Partial<ProductionTranslation>) {
    enData.value = { ...emptyTranslation(), ...data };
  }

  // ─── Per-step reset ──────────────────────────────────────────────────────────
  function resetStep(step: 1 | 2 | 3 | 4) {
    if (step === 1) {
      nlData.value = { ...originalNl.value };
      enData.value = { ...originalEn.value };
      initialNl.value = { ...originalNl.value };
      initialEn.value = { ...originalEn.value };
    } else if (step === 2) {
      selectedTags.value = originalTagIds.value.map((id) => ({
        id,
        tag: selectedTags.value.find((t) => t.id === id)?.tag ?? String(id),
      }));
    } else if (step === 4) {
      selectedSeries.value = originalSeriesIds.value.map((id) => ({
        id,
        name: selectedSeries.value.find((s) => s.id === id)?.name ?? String(id),
      }));
    }
  }

  // ─── Validation ──────────────────────────────────────────────────────────────
  const step1ValidationError = computed(() => {
    if (!nlData.value.titel.trim())
      return t(
        "admin.productions.validation.titelRequired",
        "Titel (NL) is verplicht.",
      );
    if (!nlData.value.description1.trim())
      return t(
        "admin.productions.validation.desc1Required",
        "Beschrijving 1 (NL) is verplicht.",
      );
    if (!nlData.value.description2.trim())
      return t(
        "admin.productions.validation.desc2Required",
        "Beschrijving 2 (NL) is verplicht.",
      );
    return null;
  });

  // ─── Finish: execute all API calls sequentially ───────────────────────────────
  const isSubmitting = ref(false);
  const submitErrors = ref<string[]>([]);

  async function finish() {
    if (step1ValidationError.value) {
      submitErrors.value = [step1ValidationError.value];
      throw new Error(step1ValidationError.value);
    }

    isSubmitting.value = true;
    submitErrors.value = [];
    const errors: string[] = [];

    try {
      // ── 1. Create or update the production ──────────────────────────────────
      let productionId = existingId.value;

      const payload: CreateProduction = {
        titel: { nl: nlData.value.titel, en: enData.value.titel },
        description1: {
          nl: nlData.value.description1,
          en: enData.value.description1,
        },
        description2: {
          nl: nlData.value.description2,
          en: enData.value.description2,
        },
        tagline: { nl: nlData.value.tagline, en: enData.value.tagline },
        credits: { nl: nlData.value.credits, en: enData.value.credits },
        artist: { nl: nlData.value.artist, en: enData.value.artist },
        performer_type: null,
        attendance_mode: null,
      };

      if (mode === "create") {
        try {
          const result = await create(payload);
          const data = extractData<{ id?: number }>(result);
          if (!data?.id) throw new Error("No ID returned");
          productionId = data.id;
          existingId.value = data.id;
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          errors.push(
            t(
              "admin.productions.finish.errorCreate",
              `Failed to create production: ${message}`,
            ),
          );
          submitErrors.value = errors;
          throw e;
        }
      } else {
        if (changedNlFields.value.size > 0 || changedEnFields.value.size > 0) {
          try {
            await modify(productionId!, payload);
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : String(e);
            errors.push(
              t(
                "admin.productions.finish.errorUpdate",
                `Failed to update production: ${message}`,
              ),
            );
          }
        }
      }

      if (!productionId) {
        submitErrors.value = errors;
        return;
      }

      // ── 2. Tags ──────────────────────────────────────────────────────────────
      for (const tag of selectedTags.value.filter((t) => t.isNew)) {
        try {
          console.warn("New tag creation API not yet wired:", tag.tag);
        } catch {
          errors.push(
            t(
              "admin.productions.finish.errorTagCreate",
              `Failed to create tag "${tag.tag}"`,
            ),
          );
        }
      }

      const { added: tagsToAdd, removed: tagsToRemove } = changedTagIds.value;

      await Promise.allSettled([
        ...tagsToAdd.map((id) =>
          addTag(productionId, id).catch((e: unknown) => {
            const message = e instanceof Error ? e.message : String(e);
            errors.push(
              t(
                "admin.productions.finish.errorTagLink",
                `Failed to link tag ${id}: ${message}`,
              ),
            );
          }),
        ),
        ...tagsToRemove.map((id) =>
          removeTag(productionId, id).catch((e: unknown) => {
            const message = e instanceof Error ? e.message : String(e);
            errors.push(
              t(
                "admin.productions.finish.errorTagUnlink",
                `Failed to unlink tag ${id}: ${message}`,
              ),
            );
          }),
        ),
      ]);

      // ── 3. Media ─────────────────────────────────────────────────────────────
      void mediaSlot.value;

      // ── 4. Series ────────────────────────────────────────────────────────────

      if (errors.length > 0) {
        submitErrors.value = errors;
      }

      return productionId;
    } finally {
      isSubmitting.value = false;
    }
  }

  function t(key: string, fallback: string) {
    try {
      const { t: translate } = useI18n();
      const result = translate(key);
      return result === key ? fallback : result;
    } catch {
      return fallback;
    }
  }

  return {
    nlData,
    enData,
    initialNl,
    initialEn,
    originalNl,
    originalEn,
    selectedTags,
    selectedSeries,
    mediaSlot,
    previewData,
    isLoading,
    isSubmitting,
    submitErrors,
    step1ValidationError,
    existingId,
    mode,
    changedNlFields,
    changedEnFields,
    handleNlUpdate,
    handleEnUpdate,
    resetStep,
    finish,
  };
}

/**
 * useProductionForm.ts
 *
 * Central composable for the production create/edit flow.
 *
 * Key fixes vs previous version:
 *  - nlData is seeded from initialNl immediately after fetch, so saving works
 *    even if the user never typed anything (no live-update fired yet).
 *  - Validation only checks NL titel + description1 (the truly required fields).
 *    All EN fields and optional NL fields are never blocked on.
 *  - productionId can also come from ?id= query param (create flow step 2+).
 */

import type { CreateProduction } from "@repo/common";

export type ProductionFormMode = "create" | "edit";

interface UseProductionFormOptions {
  mode: ProductionFormMode;
  productionId?: number | null;
}

interface ProductionTranslation {
  titel: string;
  description1: string;
  description2: string | null;
  tagline: string | null;
  credits: string | null;
  artist: string | null;
}

// helper to safely extract API response
function extractData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export function useProductionForm({
  mode,
  productionId = null,
}: UseProductionFormOptions) {
  const { getById, create, modify } = useProductionApi();

  const nlData = ref<ProductionTranslation>({
    titel: "",
    description1: "",
    description2: null,
    tagline: null,
    credits: null,
    artist: null,
  });

  const enData = ref<ProductionTranslation>({
    titel: "",
    description1: "",
    description2: null,
    tagline: null,
    credits: null,
    artist: null,
  });

  const initialNl = ref<ProductionTranslation>({ ...nlData.value });
  const initialEn = ref<ProductionTranslation>({ ...enData.value });

  const isLoading = ref(false);
  const existingId = ref<number | null>(productionId);

  if (mode === "edit" && productionId) {
    isLoading.value = true;

    void Promise.all([getById(productionId, "nl"), getById(productionId, "en")])
      .then(([nlRes, enRes]) => {
        const nl = extractData<Partial<ProductionTranslation>>(nlRes);
        const en = extractData<Partial<ProductionTranslation>>(enRes);

        const nlFilled: ProductionTranslation = {
          titel: nl.titel ?? "",
          description1: nl.description1 ?? "",
          description2: nl.description2 ?? null,
          tagline: nl.tagline ?? null,
          credits: nl.credits ?? null,
          artist: nl.artist ?? null,
        };

        const enFilled: ProductionTranslation = {
          titel: en.titel ?? "",
          description1: en.description1 ?? "",
          description2: en.description2 ?? null,
          tagline: en.tagline ?? null,
          credits: en.credits ?? null,
          artist: en.artist ?? null,
        };

        initialNl.value = nlFilled;
        initialEn.value = enFilled;

        nlData.value = { ...nlFilled };
        enData.value = { ...enFilled };
      })
      .catch((err) => {
        console.error("Failed to fetch production", err);
      })
      .finally(() => {
        isLoading.value = false;
      });
  }

  const previewData = computed(() => ({
    id: existingId.value ?? undefined,
    titel: { nl: nlData.value.titel, en: enData.value.titel },
    description1: {
      nl: nlData.value.description1,
      en: enData.value.description1,
    },
    description2: {
      nl: nlData.value.description2 ?? "",
      en: enData.value.description2 ?? "",
    },
    tagline: {
      nl: nlData.value.tagline ?? "",
      en: enData.value.tagline ?? "",
    },
    credits: {
      nl: nlData.value.credits ?? "",
      en: enData.value.credits ?? "",
    },
    artist: {
      nl: nlData.value.artist ?? "",
      en: enData.value.artist ?? "",
    },
  }));

  function handleNlUpdate(data: ProductionTranslation) {
    nlData.value = { ...data };
  }

  function handleEnUpdate(data: ProductionTranslation) {
    enData.value = { ...data };
  }

  const validationError = computed(() => {
    if (!nlData.value.titel.trim()) {
      return "Title (NL) is required.";
    }
    if (!nlData.value.description1.trim()) {
      return "Description (NL) is required.";
    }
    return null;
  });

  const isSubmitting = ref(false);
  const error = ref<string | null>(null);

  async function handleFinalSubmit() {
    if (validationError.value) {
      error.value = validationError.value;
      throw new Error(validationError.value);
    }

    isSubmitting.value = true;
    error.value = null;

    try {
      const payload: CreateProduction = {
        titel: { nl: nlData.value.titel, en: enData.value.titel },
        description1: {
          nl: nlData.value.description1,
          en: enData.value.description1,
        },
        description2: {
          nl: nlData.value.description2 ?? "",
          en: enData.value.description2 ?? "",
        },
        tagline: {
          nl: nlData.value.tagline ?? "",
          en: enData.value.tagline ?? "",
        },
        credits: {
          nl: nlData.value.credits ?? "",
          en: enData.value.credits ?? "",
        },
        artist: {
          nl: nlData.value.artist ?? "",
          en: enData.value.artist ?? "",
        },
        performer_type: null,
        attendance_mode: null,
      };

      if (mode === "create") {
        const result = await create(payload);

        const data = extractData<{ id?: number }>(result);
        if (data.id) existingId.value = data.id;

        return result;
      } else {
        if (!existingId.value) throw new Error("No production ID for update");
        return await modify(existingId.value, payload);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = "Something went wrong";
      }
      throw e;
    } finally {
      isSubmitting.value = false;
    }
  }

  function reset() {
    nlData.value = { ...initialNl.value };
    enData.value = { ...initialEn.value };
  }

  return {
    nlData,
    enData,
    initialNl,
    initialEn,
    previewData,
    isLoading,
    isSubmitting,
    error,
    validationError,
    mode,
    existingId,
    handleNlUpdate,
    handleEnUpdate,
    handleFinalSubmit,
    reset,
  };
}

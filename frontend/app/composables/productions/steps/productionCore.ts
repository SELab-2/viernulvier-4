import type { ProductionFormStep } from "~/types/ProductionFormStep";

export type ProductionTranslationForm = {
  titel: string;
  description1: string;
  description2: string | null;
  artist: string | null;
  tagline: string | null;
  credits: string | null;
};

export type ProductionCoreForm = {
  nl: ProductionTranslationForm;
  en: ProductionTranslationForm;
};

function createEmptyTranslation(): ProductionTranslationForm {
  return {
    titel: "",
    description1: "",
    description2: null,
    artist: null,
    tagline: null,
    credits: null,
  };
}

export function useProductionCore(): ProductionFormStep<
  ProductionCoreForm,
  ProductionCoreForm
> {
  const api = useProductionApi();

  const draft = ref<ProductionCoreForm>({
    nl: createEmptyTranslation(),
    en: createEmptyTranslation(),
  });

  const original = ref<ProductionCoreForm | null>(null);

  async function initialize(context: {
    mode: "create" | "edit";
    id?: string;
  }): Promise<void> {
    if (context.mode === "create") {
      original.value = null;
      return;
    }

    if (!context.id) return;

    const id = Number(context.id);

    const [nlRes, enRes] = await Promise.all([
      api.getById(id, "nl"),
      api.getById(id, "en"),
    ]);

    const nl = nlRes.data;
    const en = enRes.data;

    if (!nl || !en) return;

    const mapped = {
      nl: {
        titel: nl.titel,
        description1: nl.description1,
        description2: nl.description2,
        artist: nl.artist,
        tagline: nl.tagline,
        credits: nl.credits,
      },
      en: {
        titel: en.titel,
        description1: en.description1,
        description2: en.description2,
        artist: en.artist,
        tagline: en.tagline,
        credits: en.credits,
      },
    };

    original.value = mapped;
    draft.value = structuredClone(mapped);
  }

  function reset(): void {
    if (!original.value) {
      if (!original.value)
        draft.value = {
          nl: createEmptyTranslation(),
          en: createEmptyTranslation(),
        };
      return;
    }

    draft.value = structuredClone(toRaw(original.value));
  }

  function getChangedFields(): string[] {
    if (!original.value) return [];

    const changed: string[] = [];

    for (const locale of ["nl", "en"] as const) {
      for (const key of Object.keys(draft.value[locale])) {
        const typedKey = key as keyof ProductionCoreForm[typeof locale];

        if (
          draft.value[locale][typedKey] !== original.value[locale][typedKey]
        ) {
          changed.push(`${locale}.${typedKey}`);
        }
      }
    }

    return changed;
  }

  function extractPayload(): ProductionCoreForm {
    return structuredClone(toRaw(draft.value));
  }

  return {
    id: "core",
    draft,
    original,
    initialize,
    reset,
    getChangedFields,
    extractPayload,
  };
}

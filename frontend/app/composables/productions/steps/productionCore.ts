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
  const draft = reactive<ProductionCoreForm>({
    nl: createEmptyTranslation(),

    en: createEmptyTranslation(),
  });

  const original = ref<ProductionCoreForm | null>(null);

  function reset(): void {
    if (!original.value) return;

    Object.assign(draft, structuredClone(original.value));
  }

  function getChangedFields(): string[] {
    if (!original.value) return [];

    const changed: string[] = [];

    for (const locale of ["nl", "en"] as const) {
      for (const key of Object.keys(draft[locale])) {
        const typedKey = key as keyof ProductionCoreForm[typeof locale];

        if (draft[locale][typedKey] !== original.value[locale][typedKey]) {
          changed.push(`${locale}.${typedKey}`);
        }
      }
    }

    return changed;
  }

  function extractPayload(): ProductionCoreForm {
    return structuredClone(draft);
  }

  return {
    id: "core",
    draft,
    original: original.value,
    reset,
    getChangedFields,
    extractPayload,
  };
}

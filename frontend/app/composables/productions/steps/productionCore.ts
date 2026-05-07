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

export function useProductionCore(): ProductionFormStep<
  ProductionCoreForm,
  ProductionCoreForm
> {
  function reset(
    draft: ProductionCoreForm,
    original: ProductionCoreForm | null,
  ): void {
    if (!original) return;

    Object.assign(draft, structuredClone(original));
  }

  function getChangedFields(
    draft: ProductionCoreForm,
    original: ProductionCoreForm | null,
  ): string[] {
    if (!original) return [];

    const changed: string[] = [];

    for (const locale of ["nl", "en"] as const) {
      for (const key of Object.keys(draft[locale])) {
        const typedKey = key as keyof ProductionCoreForm[typeof locale];

        if (draft[locale][typedKey] !== original[locale][typedKey]) {
          changed.push(`${locale}.${typedKey}`);
        }
      }
    }

    return changed;
  }

  function extractPayload(
    draft: ProductionCoreForm,
    _original: ProductionCoreForm | null,
  ): ProductionCoreForm {
    return structuredClone(draft);
  }

  return {
    reset,
    getChangedFields,
    extractPayload,
  };
}

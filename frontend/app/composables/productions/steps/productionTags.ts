import type { ProductionFormStep } from "~/types/ProductionFormStep";

export type ExistingTag = {
  type: "existing";
  id: number;
  label: string;
};

export type NewTag = {
  type: "new";
  label: string;
};

export type ProductionTagItem = ExistingTag | NewTag;

export type ProductionTagsForm = ProductionTagItem[];

export interface ProductionTagsPayload {
  connect: number[];
  disconnect: number[];
  create: string[];
}

export function useProductionTags(): ProductionFormStep<
  ProductionTagsForm,
  ProductionTagsForm,
  ProductionTagsPayload
> {
  function reset(
    draft: ProductionTagsForm,
    original: ProductionTagsForm | null,
  ): void {
    draft.splice(
      0,
      draft.length,
      ...(original ?? []).map((tag) => ({ ...tag })),
    );
  }

  function getChangedFields(
    draft: ProductionTagsForm,
    original: ProductionTagsForm | null,
  ): string[] {
    if (!original) {
      return draft.map((tag) => {
        if (tag.type === "new") {
          return `new:${tag.label}`;
        }

        return `selected:${tag.label}`;
      });
    }

    const changes: string[] = [];

    const current = new Map(draft.map((tag) => [tag.label, tag]));

    const previous = new Map(original.map((tag) => [tag.label, tag]));

    // Added
    for (const [label, tag] of current) {
      if (!previous.has(label)) {
        changes.push(tag.type === "new" ? `new:${label}` : `selected:${label}`);
      }
    }

    // Removed
    for (const [label, _tag] of previous) {
      if (!current.has(label)) {
        changes.push(`unselected:${label}`);
      }
    }

    return changes;
  }

  function extractPayload(
    draft: ProductionTagsForm,
    original: ProductionTagsForm | null,
  ): ProductionTagsPayload {
    const originalExistingIds = new Set(
      (original ?? [])
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );

    const currentExistingIds = new Set(
      draft
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );

    const connect = [...currentExistingIds].filter(
      (id) => !originalExistingIds.has(id),
    );

    const disconnect = [...originalExistingIds].filter(
      (id) => !currentExistingIds.has(id),
    );

    const create = draft
      .filter((tag): tag is NewTag => tag.type === "new")
      .map((tag) => tag.label);

    return {
      connect,
      disconnect,
      create,
    };
  }

  return {
    reset,
    getChangedFields,
    extractPayload,
  };
}

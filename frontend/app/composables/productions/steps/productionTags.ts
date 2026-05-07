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
  const api = useProductionApi();

  const draft = ref<ProductionTagsForm>([]);

  const original = ref<ProductionTagsForm | null>(null);

  async function initialize(context: {
    mode: "create" | "edit";
    id?: string;
  }): Promise<void> {
    if (context.mode === "create") {
      original.value = null;
      draft.value = [];
      return;
    }

    if (!context.id) return;

    const id = Number(context.id);

    const res = await api.getTags(id, "nl");
    const tags = res.data ?? [];
    const mapped = tags.map((t) => ({
      type: "existing" as const,
      id: t.id,
      label: t.tag,
    }));

    original.value = mapped;
    draft.value = structuredClone(mapped);
  }

  function reset(): void {
    draft.value.splice(
      0,
      draft.value.length,
      ...(original.value ?? []).map((tag) => ({ ...tag })),
    );
  }

  function getChangedFields(): string[] {
    if (!original.value) {
      return draft.value.map((tag) => {
        if (tag.type === "new") {
          return `new:${tag.label}`;
        }

        return `selected:${tag.label}`;
      });
    }

    const changes: string[] = [];

    const current = new Map(draft.value.map((tag) => [tag.label, tag]));

    const previous = new Map(original.value.map((tag) => [tag.label, tag]));

    for (const [label, tag] of current) {
      if (!previous.has(label)) {
        changes.push(tag.type === "new" ? `new:${label}` : `selected:${label}`);
      }
    }

    for (const [label] of previous) {
      if (!current.has(label)) {
        changes.push(`unselected:${label}`);
      }
    }

    return changes;
  }

  function extractPayload(): ProductionTagsPayload {
    const originalExistingIds = new Set(
      (original.value ?? [])
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );

    const currentExistingIds = new Set(
      draft.value
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );

    const connect = [...currentExistingIds].filter(
      (id) => !originalExistingIds.has(id),
    );

    const disconnect = [...originalExistingIds].filter(
      (id) => !currentExistingIds.has(id),
    );

    const create = draft.value
      .filter((tag): tag is NewTag => tag.type === "new")
      .map((tag) => tag.label);

    return {
      connect,
      disconnect,
      create,
    };
  }

  return {
    id: "tags",
    draft,
    original,
    initialize,
    reset,
    getChangedFields,
    extractPayload,
  };
}

import type { ProductionFormStep } from "~/types/ProductionFormStep";

export type ExistingTag = {
  type: "existing";
  id: number;
  label: string;
};

export type NewTag = {
  type: "new";
  label: { nl: string; en: string };
};

export type ProductionTagItem = ExistingTag | NewTag;

export type ProductionTagsForm = ProductionTagItem[];

export interface ProductionTagsPayload {
  connect: number[];
  disconnect: number[];
  create: { nl: string; en: string }[];
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
          return `new:${tag.label.nl}`;
        }
        return `selected:${tag.id}`;
      });
    }

    const changes: string[] = [];

    const originalIds = new Set(
      original.value
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );
    const currentIds = new Set(
      draft.value
        .filter((tag): tag is ExistingTag => tag.type === "existing")
        .map((tag) => tag.id),
    );

    for (const tag of draft.value) {
      if (tag.type === "new") {
        changes.push(`new:${tag.label.nl}`);
      } else if (tag.type === "existing" && !originalIds.has(tag.id)) {
        changes.push(`selected:${tag.id}`);
      }
    }

    for (const tag of original.value) {
      if (tag.type === "existing" && !currentIds.has(tag.id)) {
        changes.push(`unselected:${tag.id}`);
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

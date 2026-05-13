/**
 * Production series step
 *
 * Maintains a draft/original list of series a production belongs to.
 * Supports:
 *  - existing series (linked by id)
 *  - new series (to be created)
 *
 * Behavior:
 *  - initialize loads existing series (production view in 'nl' and 'en') for edit mode
 *  - reset restores draft to original
 *  - getChangedFields reports human-readable change keys
 *  - extractPayload returns connect/disconnect/create lists for persistence
 *
 * Note: 'nl' fields are required in drafts/payloads; 'en' is optional but loaded if present.
 */

import type { ProductionFormStep } from "~/types/ProductionFormStep";
import type { CreateSeries } from "@repo/common";

export type LocalizedInput = { nl: string; en?: string | null };

// Existing series attached to the production (kept by id).
export type ExistingSeries = {
  type: "existing";
  id: number;
  titel: LocalizedInput;
  description: LocalizedInput;
};

// New series that will be created.
export type NewSeries = {
  type: "new";
  titel: LocalizedInput;
  description: LocalizedInput;
};

export type ProductionSeriesForm = (ExistingSeries | NewSeries)[];

export interface ProductionSeriesPayload {
  connect: number[]; // existing series ids to link
  disconnect: number[]; // existing series ids to unlink
  create: CreateSeries[]; // series to create (localized)
}

export function useProductionSeries(): ProductionFormStep<
  ProductionSeriesForm,
  ProductionSeriesForm,
  ProductionSeriesPayload
> {
  const productionApi = useProductionApi();

  const draft = ref<ProductionSeriesForm>([]);
  const original = ref<ProductionSeriesForm | null>(null);

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

    // Load production views in Dutch and English to capture localized series fields.
    const [nlRes, enRes] = await Promise.all([
      productionApi.getById(id, "nl"),
      productionApi.getById(id, "en"),
    ]);

    const nlSeries =
      (nlRes.data as { series?: unknown } | undefined)?.series ?? [];
    const enSeries =
      (enRes.data as { series?: unknown } | undefined)?.series ?? [];

    // Build a map of english series by id for quick lookups (may be empty).
    type SeriesViewLike = {
      id: number;
      titel?: string;
      title?: string;
      description?: string;
    };
    const enById = new Map<number, SeriesViewLike>();
    for (const s of enSeries as SeriesViewLike[]) {
      if (s && typeof s.id === "number") enById.set(s.id, s);
    }

    const mapped = (nlSeries as SeriesViewLike[]).map<ExistingSeries>((s) => {
      const nlTitel = s.titel ?? s.title ?? String(s.id);
      const nlDesc = s.description ?? "";
      const enMatch = enById.get(s.id);
      const enTitel = enMatch?.titel ?? enMatch?.title ?? undefined;
      const enDesc = enMatch?.description ?? undefined;

      return {
        type: "existing",
        id: s.id,
        titel: { nl: nlTitel, en: enTitel ?? undefined },
        description: { nl: nlDesc, en: enDesc ?? undefined },
      };
    });

    original.value = mapped;
    draft.value = structuredClone(mapped);
  }

  function reset(): void {
    draft.value.splice(
      0,
      draft.value.length,
      ...(original.value ?? []).map((s) => ({ ...s })),
    );
  }

  function getChangedFields(): string[] {
    if (!original.value) {
      // Create mode: list current selections/new items
      return draft.value.map((s) => {
        const title = s.titel.nl;
        return s.type === "new" ? `new:${title}` : `selected:${title}`;
      });
    }

    const changes: string[] = [];

    // Track existing items by id for additions/removals.
    const origExistingById = new Map<number, ExistingSeries>();
    for (const s of original.value) {
      if (s.type === "existing") origExistingById.set(s.id, s);
    }

    const currExistingById = new Map<number, ExistingSeries>();
    for (const s of draft.value) {
      if (s.type === "existing") currExistingById.set(s.id, s);
    }

    // Added existing series
    for (const [id, s] of currExistingById) {
      if (!origExistingById.has(id)) {
        changes.push(`selected:${s.titel.nl}`);
      }
    }

    // Removed existing series
    for (const [id, s] of origExistingById) {
      if (!currExistingById.has(id)) {
        changes.push(`unselected:${s.titel.nl}`);
      }
    }

    // New series (always considered additions)
    for (const s of draft.value) {
      if (s.type === "new") {
        changes.push(`new:${s.titel.nl}`);
      }
    }

    return changes;
  }

  function extractPayload(): ProductionSeriesPayload {
    const originalExistingIds = new Set(
      (original.value ?? [])
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => s.id),
    );

    const currentExistingIds = new Set(
      draft.value
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => s.id),
    );

    const connect = [...currentExistingIds].filter(
      (id) => !originalExistingIds.has(id),
    );

    const disconnect = [...originalExistingIds].filter(
      (id) => !currentExistingIds.has(id),
    );

    // Build CreateSeries objects for new series. Dutch is required; English
    // falls back to Dutch when not provided to keep payload shape consistent.
    const create: CreateSeries[] = draft.value
      .filter((s): s is NewSeries => s.type === "new")
      .map((s) => {
        const nlTitel = s.titel.nl;
        const enTitel = s.titel.en ?? nlTitel;
        const nlDesc = s.description.nl ?? "";
        const enDesc = s.description.en ?? nlDesc;

        return {
          titel: { nl: nlTitel, en: enTitel },
          description: { nl: nlDesc, en: enDesc },
        };
      });

    return {
      connect,
      disconnect,
      create,
    };
  }

  return {
    id: "series",
    draft,
    original,
    initialize,
    reset,
    getChangedFields,
    extractPayload,
  };
}

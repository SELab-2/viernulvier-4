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

export interface UpdateSeriesItem {
  id: number;
  titel: LocalizedInput;
  description: LocalizedInput;
}

export interface ProductionSeriesPayload {
  connect: number[]; // existing series ids to link
  disconnect: number[]; // existing series ids to unlink
  create: CreateSeries[]; // series to create (localized)
  update: UpdateSeriesItem[]; // existing series ids to update
}

export function useProductionSeries(): ProductionFormStep<
  ProductionSeriesForm,
  ProductionSeriesForm,
  ProductionSeriesPayload
> {
  const seriesApi = useSeriesApi();

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

    // Fetch all series linked to this production in both languages.
    const [nlRes, enRes] = await Promise.all([
      seriesApi.getAll({
        languageFilters: { lang: "nl" },
        seriesFilters: {
          is_suggestion: false,
          production_id: id,
        },
      }),
      seriesApi.getAll({
        languageFilters: { lang: "en" },
        seriesFilters: {
          is_suggestion: false,
          production_id: id,
        },
      }),
    ]);

    type SeriesObject = { id: number; titel: string; description: string };

    const nlObjects =
      (nlRes.data as unknown as { objects?: SeriesObject[] })?.objects ?? [];
    const enObjects =
      (enRes.data as unknown as { objects?: SeriesObject[] })?.objects ?? [];

    // Build a map of english series by id for quick lookups.
    const enById = new Map<number, SeriesObject>();
    for (const s of enObjects) {
      enById.set(s.id, s);
    }

    const mapped = nlObjects.map<ExistingSeries>((s) => {
      const enMatch = enById.get(s.id);
      return {
        type: "existing",
        id: s.id,
        titel: { nl: s.titel, en: enMatch?.titel ?? undefined },
        description: {
          nl: s.description,
          en: enMatch?.description ?? undefined,
        },
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

  function isEqualSeries(a: LocalizedInput, b: LocalizedInput): boolean {
    return a.nl === b.nl && (a.en ?? null) === (b.en ?? null);
  }

  function extractPayload(): ProductionSeriesPayload {
    const originalExistingIds = new Set(
      (original.value ?? [])
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => s.id),
    );

    const originalExistingMap = new Map<number, ExistingSeries>();
    for (const s of original.value ?? []) {
      if (s.type === "existing") {
        originalExistingMap.set(s.id, s);
      }
    }

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

    const update: UpdateSeriesItem[] = draft.value
      .filter((s): s is ExistingSeries => s.type === "existing")
      .map((s) => {
        const originalItem = originalExistingMap.get(s.id);

        if (!originalItem) return null;

        const changed =
          !isEqualSeries(s.titel, originalItem.titel) ||
          !isEqualSeries(s.description, originalItem.description);

        if (!changed) return null;

        return {
          id: s.id,
          titel: s.titel,
          description: s.description,
        };
      })
      .filter((x): x is UpdateSeriesItem => x !== null);

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
      update,
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

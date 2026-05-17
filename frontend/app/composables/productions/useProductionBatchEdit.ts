/**
 * useProductionBatchEdit.ts
 *
 * Manages batch edit mode for the admin productions page.
 * Handles: mode toggle, selection, deselection, panel state,
 * batch tag editing, and batch series editing.
 *
 * Designed to be used as a singleton (shared state across all components on the page).
 */

import { ref, computed } from "vue";
import type { ProductionView } from "@repo/common";
import type {
  ProductionTagItem,
  ExistingTag,
  NewTag,
} from "~/composables/productions/steps/productionTags";
import type {
  ProductionSeriesForm,
  ExistingSeries,
} from "~/composables/productions/steps/productionSeries";

// ── Singleton state ───────────────────────────────────────────────────────────

const isBatchEditMode = ref(false);
const selectedProductions = ref<ProductionView[]>([]);
const isPanelCollapsed = ref(false);

// ── Batch tag state ───────────────────────────────────────────────────────────

/**
 * Tags shared by ALL selected productions (the intersection).
 * This is the saved baseline — reset and save both use this as the reference.
 */
const commonTags = ref<ProductionTagItem[]>([]);

/**
 * Working draft the user edits in the UI.
 * Starts as a clone of commonTags on every (re)load and diverges as the user
 * makes changes. Reset always restores this back to commonTags.
 */
const tagsDraft = ref<ProductionTagItem[]>([]);

/**
 * Tracks whether commonTags has been loaded for the current session.
 * Set to false on every entry to the batch edit page so each visit does a
 * fresh fetch from the server — unsaved edits are intentionally discarded.
 */
const commonTagsLoaded = ref(false);

// ── Batch series state ────────────────────────────────────────────────────────

/**
 * Series shared by ALL selected productions (the intersection).
 * This is the saved baseline — reset and save both use this as the reference.
 */
const commonSeries = ref<ProductionSeriesForm>([]);

/**
 * Working draft the user edits in the UI via SeriesForm.
 * Starts as a clone of commonSeries on every (re)load.
 * Reset restores this back to commonSeries.
 */
const seriesDraft = ref<ProductionSeriesForm>([]);

/**
 * Tracks whether commonSeries has been loaded for the current session.
 */
const commonSeriesLoaded = ref(false);

// ── Composable ────────────────────────────────────────────────────────────────

export function useProductionBatchEdit() {
  // ── Mode ─────────────────────────────────────────────────────────────────

  function enableBatchEditMode() {
    isBatchEditMode.value = true;
    selectedProductions.value = [];
    isPanelCollapsed.value = false;
  }

  function disableBatchEditMode() {
    isBatchEditMode.value = false;
    selectedProductions.value = [];
    isPanelCollapsed.value = false;
  }

  function toggleBatchEditMode() {
    if (isBatchEditMode.value) {
      disableBatchEditMode();
    } else {
      enableBatchEditMode();
    }
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectedCount = computed(() => selectedProductions.value.length);
  const hasSelections = computed(() => selectedProductions.value.length > 0);

  function isSelected(production: ProductionView): boolean {
    return selectedProductions.value.some((p) => p.id === production.id);
  }

  function selectProduction(production: ProductionView) {
    if (!isSelected(production)) {
      selectedProductions.value.push(production);
    }
  }

  function deselectProduction(production: ProductionView) {
    selectedProductions.value = selectedProductions.value.filter(
      (p) => p.id !== production.id,
    );
  }

  function toggleSelection(production: ProductionView) {
    if (isSelected(production)) {
      deselectProduction(production);
    } else {
      selectProduction(production);
    }
  }

  function clearSelection() {
    selectedProductions.value = [];
  }

  // ── Panel ─────────────────────────────────────────────────────────────────

  function togglePanel() {
    isPanelCollapsed.value = !isPanelCollapsed.value;
  }

  // ── Batch tag editing ─────────────────────────────────────────────────────

  /**
   * Fetches tags for every selected production in parallel, then keeps only
   * those present in ALL of them (set intersection).
   *
   * Always resets the draft to the fresh server state, discarding any
   * unsaved edits. Call this on page entry and after every successful save.
   *
   * The caller supplies the fetch function so this composable stays
   * API-agnostic and easy to test.
   */
  async function loadCommonTags(
    fetchTagsForProduction: (
      id: number,
    ) => Promise<{ id: number; tag: string }[]>,
  ): Promise<void> {
    commonTagsLoaded.value = false;

    if (selectedProductions.value.length === 0) {
      commonTags.value = [];
      tagsDraft.value = [];
      commonTagsLoaded.value = true;
      return;
    }

    const results = await Promise.all(
      selectedProductions.value.map((p) => fetchTagsForProduction(p.id)),
    );

    // Seed the intersection from the first result.
    // The empty-selection guard above ensures results is never empty here.
    const intersection = new Map(results[0]!.map((t) => [t.id, t.tag]));

    // Narrow against every subsequent result.
    for (const tags of results.slice(1)) {
      const tagIds = new Set(tags.map((t) => t.id));
      for (const id of intersection.keys()) {
        if (!tagIds.has(id)) intersection.delete(id);
      }
    }

    const mapped: ExistingTag[] = [...intersection.entries()].map(
      ([id, label]) => ({ type: "existing", id, label }),
    );

    commonTags.value = mapped;
    tagsDraft.value = structuredClone(mapped);
    commonTagsLoaded.value = true;
  }

  /** Replace the working draft — called by TagSelector via @change. */
  function setTagsDraft(items: ProductionTagItem[]) {
    tagsDraft.value = items;
  }

  /**
   * Reset the draft back to the server baseline, mirroring productionTags.ts.
   * Direct ref assignment always triggers Vue reactivity — no splice subtleties.
   */
  function resetTagsDraft() {
    tagsDraft.value = commonTags.value.map((tag) => ({ ...tag }));
  }

  /**
   * Diffs the draft against the common-tags baseline to produce the
   * connect / disconnect / create payload for the API.
   */
  function extractTagsPayload(): {
    connect: number[];
    disconnect: number[];
    create: string[];
  } {
    const originalIds = new Set(
      commonTags.value
        .filter((t): t is ExistingTag => t.type === "existing")
        .map((t) => t.id),
    );

    const currentIds = new Set(
      tagsDraft.value
        .filter((t): t is ExistingTag => t.type === "existing")
        .map((t) => t.id),
    );

    return {
      connect: [...currentIds].filter((id) => !originalIds.has(id)),
      disconnect: [...originalIds].filter((id) => !currentIds.has(id)),
      create: tagsDraft.value
        .filter((t): t is NewTag => t.type === "new")
        .map((t) => t.label),
    };
  }

  // ── Batch series editing ──────────────────────────────────────────────────

  /**
   * Fetches series for every selected production in parallel, then keeps only
   * those present in ALL of them (set intersection by series id).
   *
   * The caller supplies the fetch function (same API-agnostic pattern as tags).
   */
  async function loadCommonSeries(
    fetchSeriesForProduction: (id: number) => Promise<ExistingSeries[]>,
  ): Promise<void> {
    commonSeriesLoaded.value = false;

    if (selectedProductions.value.length === 0) {
      commonSeries.value = [];
      seriesDraft.value = [];
      commonSeriesLoaded.value = true;
      return;
    }

    const results = await Promise.all(
      selectedProductions.value.map((p) => fetchSeriesForProduction(p.id)),
    );

    // Seed the intersection from the first production's series.
    const intersectionMap = new Map(results[0]!.map((s) => [s.id, s]));

    // Narrow to only series present in every other production.
    for (const seriesList of results.slice(1)) {
      const ids = new Set(seriesList.map((s) => s.id));
      for (const id of intersectionMap.keys()) {
        if (!ids.has(id)) intersectionMap.delete(id);
      }
    }

    const mapped = [...intersectionMap.values()];

    commonSeries.value = mapped;
    seriesDraft.value = structuredClone(mapped);
    commonSeriesLoaded.value = true;
  }

  /** Replace the series draft — called when SeriesForm emits update:modelValue. */
  function setSeriesDraft(items: ProductionSeriesForm) {
    seriesDraft.value = items;
  }

  /** Reset the series draft back to the server baseline. */
  function resetSeriesDraft() {
    seriesDraft.value = structuredClone(commonSeries.value);
  }

  /**
   * Diffs the series draft against the common-series baseline.
   *
   * connect    — existing series added relative to the baseline
   * disconnect — existing series removed relative to the baseline
   * create     — brand-new series (type: "new")
   * update     — existing series whose titel or description changed
   *
   * connect/disconnect are relative to the COMMON baseline, so applying the
   * same diff to every production is correct and idempotent on the backend.
   */
  function extractSeriesPayload() {
    const originalIds = new Set(
      commonSeries.value
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => s.id),
    );

    const originalMap = new Map(
      commonSeries.value
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => [s.id, s]),
    );

    const currentExisting = seriesDraft.value.filter(
      (s): s is ExistingSeries => s.type === "existing",
    );

    const currentIds = new Set(currentExisting.map((s) => s.id));

    const connect = currentExisting
      .filter((s) => !originalIds.has(s.id))
      .map((s) => s.id);

    const disconnect = [...originalIds].filter((id) => !currentIds.has(id));

    // Detect field edits for existing series that were already in the baseline.
    const update = currentExisting
      .filter((s) => originalIds.has(s.id))
      .flatMap((s) => {
        const orig = originalMap.get(s.id)!;
        const changed =
          s.titel.nl !== orig.titel.nl ||
          (s.titel.en ?? null) !== (orig.titel.en ?? null) ||
          s.description.nl !== orig.description.nl ||
          (s.description.en ?? null) !== (orig.description.en ?? null);
        return changed
          ? [{ id: s.id, titel: s.titel, description: s.description }]
          : [];
      });

    const create = seriesDraft.value
      .filter((s) => s.type === "new")
      .map((s) => {
        const nl_titel = s.titel.nl;
        const en_titel = s.titel.en ?? nl_titel;
        const nl_desc = s.description.nl ?? "";
        const en_desc = s.description.en ?? nl_desc;
        return {
          titel: { nl: nl_titel, en: en_titel },
          description: { nl: nl_desc, en: en_desc },
        };
      });

    return { connect, disconnect, create, update };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    // State
    isBatchEditMode,
    selectedProductions,
    isPanelCollapsed,

    // Computed
    selectedCount,
    hasSelections,

    // Mode actions
    enableBatchEditMode,
    disableBatchEditMode,
    toggleBatchEditMode,

    // Selection actions
    isSelected,
    selectProduction,
    deselectProduction,
    toggleSelection,
    clearSelection,

    // Panel actions
    togglePanel,

    // Batch tag state & actions
    tagsDraft,
    commonTagsLoaded,
    loadCommonTags,
    setTagsDraft,
    resetTagsDraft,
    extractTagsPayload,

    // Batch series state & actions
    seriesDraft,
    commonSeriesLoaded,
    loadCommonSeries,
    setSeriesDraft,
    resetSeriesDraft,
    extractSeriesPayload,
  };
}

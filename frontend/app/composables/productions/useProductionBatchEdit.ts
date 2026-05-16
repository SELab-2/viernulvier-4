/**
 * useProductionBatchEdit.ts
 *
 * Manages batch edit mode for the admin productions page.
 * Handles: mode toggle, selection, deselection, panel state, and batch tag editing.
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

    // Mutate in-place so Vue's reactivity picks up the change even when the
    // new array is structurally identical to the previous one (e.g. after a
    // reset). Replacing the reference with = [...] can silently no-op when
    // the TagSelector has already rendered the old array.
    tagsDraft.value.splice(
      0,
      tagsDraft.value.length,
      ...structuredClone(mapped),
    );

    commonTagsLoaded.value = true;
  }

  /** Replace the working draft — called by TagSelector via @change. */
  function setTagsDraft(items: ProductionTagItem[]) {
    tagsDraft.value = items;
  }

  /**
   * Reset the draft back to the current server baseline (commonTags).
   * Mutates in-place so TagSelector always re-renders, even when the
   * reset value is structurally identical to the current draft.
   */
  function resetTagsDraft() {
    tagsDraft.value.splice(
      0,
      tagsDraft.value.length,
      ...structuredClone(commonTags.value),
    );
  }

  /**
   * Diffs the draft against the common-tags baseline to produce the
   * connect / disconnect / create payload for the API.
   *
   * connect / disconnect are relative to the COMMON baseline, not each
   * production's individual tag list. The backend is expected to be
   * idempotent (connecting a tag a production already has is a no-op).
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
    commonTags,
    tagsDraft,
    commonTagsLoaded,
    loadCommonTags,
    setTagsDraft,
    resetTagsDraft,
    extractTagsPayload,
  };
}

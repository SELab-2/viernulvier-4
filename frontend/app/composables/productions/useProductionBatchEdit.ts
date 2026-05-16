/**
 * useProductionBatchEdit.ts
 *
 * Manages the batch edit mode state for the admin productions page.
 * Handles: mode toggle, selection, deselection, and panel state.
 *
 * Designed to be used as a singleton (shared state across components on the page).
 */

// TODO: this file is work in progress.
import { ref, computed } from "vue";
import type { ProductionView } from "@repo/common";

// Singleton state — shared across all components while the page is mounted.
const isBatchEditMode = ref(false);
const selectedProductions = ref<ProductionView[]>([]);
const isPanelCollapsed = ref(false);

export function useProductionBatchEdit() {
  // ── Mode ────────────────────────────────────────────────────────────────

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

  // ── Selection ────────────────────────────────────────────────────────────

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

  // ── Panel ────────────────────────────────────────────────────────────────

  function togglePanel() {
    isPanelCollapsed.value = !isPanelCollapsed.value;
  }

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
  };
}

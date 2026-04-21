import { ref } from "vue";
/**
 * Shared state for the Prints feature.
 * Acts as a lightweight global store for filters, pagination, and view settings.
 */

import type { PrintType } from "@repo/common";

// Filters
const searchQuery = ref("");
const activeFilter = ref<PrintType | null>(null);

// Pagination
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(1);

// Loading state
const loading = ref(false);
const fetchError = ref<Error | null>(null);

export function usePrintView() {
  return {
    searchQuery,
    activeFilter,
    currentPage,
    totalItems,
    totalPages,
    loading,
    fetchError,
  };
}

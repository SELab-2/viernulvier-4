import { ref } from "vue";
/**
 * Shared state for the series.
 * Acts as a lightweight global store for pagination.
 */

// Pagination
const currentPage = ref(0);
const totalItems = ref(0);
const totalPages = ref(1);

// Loading state
const loading = ref(false);
const fetchError = ref<Error | null>(null);

export function useSeriesView() {
  return {
    currentPage,
    totalItems,
    totalPages,
    loading,
    fetchError,
  };
}

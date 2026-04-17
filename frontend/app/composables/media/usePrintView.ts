import { ref } from "vue";
import type { PrintType } from "@repo/common";
import { PrintTypeValues } from "@repo/common";

// Filters
const searchQuery = ref("");
const activeFilter = ref<PrintType>(PrintTypeValues[0]);

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

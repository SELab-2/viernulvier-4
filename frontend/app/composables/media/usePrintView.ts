import { ref } from "vue";
import type { PrintType } from "@repo/common";
import { PrintTypeValues } from "@repo/common";

// Filters
const searchQuery = ref("");
const activeFilter = ref<PrintType>(PrintTypeValues[0]);

// Pagination
const currentPage = ref(0);
const totalItems = ref(0);

// Loading state
const loading = ref(false);

export function usePrintView() {
  return {
    searchQuery,
    activeFilter,
    currentPage,
    totalItems,
    loading,
  };
}

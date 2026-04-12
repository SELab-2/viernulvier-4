import { ref } from "vue";

/**
 * Shared state for the Archive feature.
 * Acts as a lightweight global store for filters, pagination, and view settings.
 */

export type ArchiveViewMode = "grid" | "list";

// UI state
const viewMode = ref<ArchiveViewMode>("grid");

// Filters
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const dateFilter = ref<{ after?: string; before?: string }>({});
const tagIds = ref<number[]>([]);

// Pagination
const currentPage = ref(1);
const totalPages = ref(1);

// Data/loading state
const loading = ref(false);
const oldestDate = ref("");

export function useArchiveView() {
  return {
    viewMode,
    searchQuery,
    sortOrder,
    dateFilter,
    tagIds,

    currentPage,
    totalPages,

    loading,
    oldestDate,
  };
}

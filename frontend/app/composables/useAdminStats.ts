// composables/useAdminStats.ts
// ============================
// Fetches total item counts for productions, blogs, events and prints in
// parallel. Each call uses limit:1 so only the totalItems metadata field
// is needed — minimal network transfer.

import { ref } from "vue";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import { usePrintApi } from "~/composables/media/usePrintApi";

export interface AdminStats {
  productions: number | null;
  blogs: number | null;
  events: number | null;
  prints: number | null;
}

export function useAdminStats() {
  const stats = ref<AdminStats>({
    productions: null,
    blogs: null,
    events: null,
    prints: null,
  });
  const loading = ref(true);

  const { getAll: getProductions } = useProductionApi();
  const { getAll: getBlogs } = useBlogApi();
  const { getAll: getEvents } = useEventApi();
  const { getAll: getPrints } = usePrintApi();

  async function fetchStats() {
    loading.value = true;
    try {
      const [prodResp, blogResp, eventResp, printResp] =
        await Promise.allSettled([
          getProductions({
            paginationFilters: { page: 0, limit: 1, descending: true },
          }),
          getBlogs({
            paginationFilters: { page: 0, limit: 1, descending: true },
          }),
          getEvents({
            paginationFilters: { page: 0, limit: 1, descending: true },
          }),
          getPrints({
            paginationFilters: { page: 0, limit: 1, descending: true },
          }),
        ]);

      stats.value.productions =
        prodResp.status === "fulfilled"
          ? (prodResp.value.data?.totalItems ?? null)
          : null;
      stats.value.blogs =
        blogResp.status === "fulfilled"
          ? (blogResp.value.data?.totalItems ?? null)
          : null;
      stats.value.events =
        eventResp.status === "fulfilled"
          ? (eventResp.value.data?.totalItems ?? null)
          : null;
      stats.value.prints =
        printResp.status === "fulfilled"
          ? (printResp.value.data?.totalItems ?? null)
          : null;
    } finally {
      loading.value = false;
    }
  }

  return { stats, loading, fetchStats };
}

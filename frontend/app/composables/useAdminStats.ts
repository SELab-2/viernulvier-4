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
import { useSeriesApi } from "~/composables/useSeriesApi";
import { useTagApi } from "~/composables/useTagApi";

export interface AdminStats {
  productions: number | null;
  blogs: number | null;
  events: number | null;
  prints: number | null;
  series: number | null;
  tags: number | null;
}

export function useAdminStats() {
  const stats = ref<AdminStats>({
    productions: null,
    blogs: null,
    events: null,
    prints: null,
    series: null,
    tags: null,
  });
  const loading = ref(true);

  const { getAll: getProductions } = useProductionApi();
  const { getAll: getBlogs } = useBlogApi();
  const { getAll: getEvents } = useEventApi();
  const { getAll: getPrints } = usePrintApi();
  const { getAll: getSeries } = useSeriesApi();
  const { getAll: getTags } = useTagApi();

  async function fetchStats() {
    loading.value = true;
    try {
      const [prodResp, blogResp, eventResp, printResp, seriesResp, tagResp] =
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
          getSeries({
            paginationFilters: { page: 0, limit: 1, descending: true },
          }),
          getTags({
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
      stats.value.series =
        seriesResp.status === "fulfilled"
          ? (seriesResp.value.data?.totalItems ?? null)
          : null;
      stats.value.tags =
        tagResp.status === "fulfilled"
          ? (tagResp.value.data?.totalItems ?? null)
          : null;
    } finally {
      loading.value = false;
    }
  }

  return { stats, loading, fetchStats };
}

const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const loading = ref(false);

export function useSeriesProductionsView() {
  return { currentPage, totalPages, totalItems, loading };
}

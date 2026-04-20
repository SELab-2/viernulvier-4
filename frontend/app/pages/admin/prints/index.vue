<script setup lang="ts">
import type { PrintItemView, PaginatedResponse } from "@repo/common";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { usePrintView } from "../../../composables/media/usePrintView";
import PrintsToolbar from "../../../components/prints/PrintsToolbar.vue";
import FileList from "../../../components/prints/FileList.vue";
const { locale } = useI18n();
const { getAll } = usePrintApi();
const {
  searchQuery,
  activeFilter,
  currentPage,
  totalItems,
  totalPages,
  loading,
  fetchError,
} = usePrintView();

const prints = ref<PrintItemView[]>([]);
const LIMIT = 15;

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
}

async function loadPage() {
  loading.value = true;
  fetchError.value = null;
  try {
    const raw = await getAll({
      paginationFilters: {
        page: currentPage.value,
        limit: LIMIT,
        descending: true,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      printItemFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(activeFilter.value ? { type: activeFilter.value } : {}),
      },
    });

    const paged = unwrap(raw);
    prints.value = (paged?.objects ?? []) as PrintItemView[];
    totalItems.value = paged?.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / LIMIT));
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    loading.value = false;
  }
}

watch([searchQuery, locale], () => {
  currentPage.value = 0;
  loadPage();
});
watch(activeFilter, () => {
  currentPage.value = 0;
  loadPage();
});
watch(currentPage, loadPage, { immediate: false });

onMounted(() => {
  loadPage();
});
</script>

<template>
  <PrintsToolbar
    @update:search="searchQuery = $event"
    @update:types="activeFilter = $event"
  />
  <div class="container mx-auto px-4 max-w-5xl py-6">
    <FileList
      :category="activeFilter"
      :files="prints"
      :total-pages="totalPages"
    />

    <div class="flex items-center justify-between mt-6">
      <PrintsPageJumper
        :current-page="currentPage"
        :total-pages="totalPages"
        :loading="loading"
        @go-to-page="currentPage = $event"
      />
      <PrintsPagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :loading="loading"
        @go-to-page="currentPage = $event"
      />
    </div>
  </div>
</template>

<style scoped></style>

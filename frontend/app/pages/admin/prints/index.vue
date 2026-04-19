<script setup lang="ts">
import { usePrintApi } from "../../../composables/media/usePrintApi";
import type { PrintType, PrintItemView, PaginatedResponse } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import FileList from "../../../components/prints/FileList.vue";
import PrintsToolbar from "../../../components/prints/PrintsToolbar.vue";
import { ref } from "vue";

const { locale } = useI18n();
const { getAll } = usePrintApi();

const prints = ref<PrintItemView[]>([]);

//  Pagination
const currentPage = ref(0);
const activeFilter = ref<PrintType>(PrintTypeValues[0]);
const LIMIT = 15;

const totalItems = ref(0);
const totalPages = ref(1);

const loading = ref(true);
const fetchError = ref<Error | null>(null);

const searchQuery = ref("");

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
}

async function loadPage() {
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
        type: activeFilter.value,
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
    <FileList :category="activeFilter" :files="prints" />
  </div>
  <div class="flex items-center justify-between mt-6">
    <PrintsPageJumper />
    <PrintsPagination />
  </div>
</template>

<style scoped></style>

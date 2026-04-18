<script setup lang="ts">
import { usePrintApi } from "../../../composables/media/usePrintApi";
import type { PrintItemView, PaginatedResponse } from "@repo/common";
import { PrintTypeValues } from "@repo/common";
import FileList from "../../../components/prints/FileList.vue";

const { locale } = useI18n();
const { getAll } = usePrintApi();

const currentPage = ref(0);
const activeFilter = ref(PrintTypeValues[0]);
const LIMIT = ref(20);

const prints = ref<PrintItemView[]>([]);
const totalItems = ref(0);
const totalPages = ref(1);

const loading = ref(true);
const fetchError = ref<Error | null>(null);

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
        limit: LIMIT.value,
        descending: true,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      printItemFilters: {
        type: activeFilter.value,
      },
    });

    const paged = unwrap(raw);
    prints.value = (paged?.objects ?? []) as PrintItemView[];
    totalItems.value = paged?.totalItems ?? 0;
    totalPages.value = Math.max(1, Math.ceil(totalItems.value / LIMIT.value));
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPage();
});
</script>

<template>
  <FileList :category="activeFilter" :files="prints" />
</template>

<style scoped></style>

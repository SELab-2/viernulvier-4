<!--
  pages/admin/prints/index.vue

  Admin Print List Page

  This page serves as the entry point for managing prints
  within the admin panel.

  It renders the print list view component, which is responsible for:
  - Displaying all existing prints
  - Handling actions such as downloading and deleting entries
  - List items are clickable and can be opened in another tab
-->

<script setup lang="ts">
import type { PrintItemView, PaginatedResponse } from "@repo/common";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { usePrintView } from "../../../composables/media/usePrintView";
import PrintsToolbar from "../../../components/prints/PrintsToolbar.vue";
import FileList from "../../../components/prints/FileList.vue";

const { t, locale } = useI18n();
const { getAll, remove } = usePrintApi();
const {
  searchQuery,
  activeFilter,
  currentPage,
  totalItems,
  totalPages,
  loading,
  fetchError,
} = usePrintView();

const prints = ref<PrintItemView[]>([]); // list of prints for the current page (reactive)
const LIMIT = 15; // maximum prints per page

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data; // unwrap the data if wrapped: { data: { objects: [...] } } -> { objects: [...] }
  if ("objects" in (r as object)) return r as any; // return the data as it is if not wrapped: { objects: [...] }
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
        is_suggestion: false,
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

async function handleDelete(file: PrintItemView) {
  if (!confirm(t("prints.deleteConfirm", { name: file.titel }))) return;
  try {
    await remove(file.id);
    await loadPage();
  } catch (e) {
    fetchError.value = e as Error;
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
  <!-- Header -->
  <div
    class="container mx-auto px-4 max-w-5xl py-3 pt-10 flex items-center justify-between"
  >
    <h1
      class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
    >
      {{ t("prints.title") }}
    </h1>
    <!-- Add button -->
    <NuxtLink
      :to="ROUTES.admin.prints.create"
      class="h-9 gap-2 flex items-center px-4 rounded-md text-[11px] font-black uppercase tracking-widest transition-all bg-purple-700 hover:bg-purple-500 text-white"
    >
      + {{ t("prints.add") }}
    </NuxtLink>
  </div>

  <PrintsToolbar
    @update:search="searchQuery = $event"
    @update:types="activeFilter = $event"
  />

  <!-- File list -->
  <div class="container mx-auto px-4 max-w-5xl py-6">
    <FileList
      :category="activeFilter"
      :files="prints"
      :total-pages="totalPages"
      @delete="handleDelete"
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

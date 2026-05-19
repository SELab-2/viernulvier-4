<!--
  components/admin/series/ListView.vue
  ======================================
  Admin series list — orchestrates fetching, filtering, and management.
-->

<script setup lang="ts">
import type { Series, PaginatedResponse, ProductionView } from "@repo/common";
import { Search } from "lucide-vue-next";
import { useSeriesApi } from "~/composables/useSeriesApi";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import { useArchiveView } from "~/composables/useArchiveView";
import { ROUTES } from "~/utils/routes";

const { getAll, modify, remove, getSeriesProductions } = useSeriesApi();
const { selectWholeSeries } = useProductionBatchEdit();
const { t, locale } = useI18n();
const snackbar = useSnackbar();
const router = useRouter();

const { currentPage, totalPages, loading } = useArchiveView();

// State
const seriesList = ref<Series[]>([]);
const error = ref<string | null>(null);
const searchQuery = ref("");
const expandedId = ref<number | null>(null);

// Pagination
const totalItems = ref(0);
const PAGE_SIZE = 15;

// Action state
const savingIds = ref(new Set<number>());
const deletingIds = ref(new Set<number>());

async function loadSeries() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: currentPage.value - 1,
        limit: PAGE_SIZE,
        descending: true,
      },
      seriesFilters: {
        title: searchQuery.value || undefined,
        is_suggestion: false,
      },
    });

    if (resp.data) {
      const data = resp.data as PaginatedResponse<Series>;
      seriesList.value = data.objects;
      totalItems.value = data.totalItems;
      totalPages.value = Math.max(1, Math.ceil(data.totalItems / PAGE_SIZE));
    }
  } catch (err) {
    error.value = "Failed to load series";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Watchers
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1; // Reset to page 1 for new search
    loadSeries();
  }, 350);
});

watch(currentPage, (newVal, oldVal) => {
  if (newVal !== oldVal) loadSeries();
});

// Actions
async function handleSave(data: { id: number; titel: any; description: any }) {
  savingIds.value.add(data.id);
  try {
    const resp = await modify(data.id, {
      titel: data.titel,
      description: data.description,
    });

    if (resp.error) {
      snackbar.add({ type: "error", text: resp.error });
    } else {
      snackbar.add({
        type: "success",
        text: t("general.saveSuccess", "Series saved successfully"),
      });
      // Update local state
      const idx = seriesList.value.findIndex((s) => s.id === data.id);
      if (idx !== -1) seriesList.value[idx] = resp.data as Series;
    }
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to save series" });
  } finally {
    savingIds.value.delete(data.id);
  }
}

async function handleDelete(id: number, title: string) {
  if (!confirm(t("general.deleteConfirm", { name: title }))) return;

  deletingIds.value.add(id);
  try {
    const resp = await remove(id);
    if (resp.error) {
      snackbar.add({ type: "error", text: resp.error });
    } else {
      snackbar.add({
        type: "success",
        text: t("general.deleteSuccess", { name: title }),
      });
      await loadSeries();
    }
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to delete series" });
  } finally {
    deletingIds.value.delete(id);
  }
}

async function handleBatchEdit(seriesId: number) {
  try {
    await selectWholeSeries(seriesId, async (id) => {
      const resp = await getSeriesProductions(id, locale.value as any);
      return (resp.data?.objects as ProductionView[]) || [];
    });
    router.push(ROUTES.admin.productions.batchEdit);
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to prepare batch edit" });
  }
}

function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id;
}

onMounted(() => {
  currentPage.value = 1; // Always start at page 1 when entering the series management
  loadSeries();
});
</script>

<template>
  <div class="bg-background min-h-[calc(100vh-120px)]">
    <!-- Toolbar -->
    <div
      class="page-container py-5 flex items-center gap-3 border-b border-border bg-background sticky top-14 z-10"
    >
      <div class="flex-1 min-w-0 relative">
        <Search
          :size="14"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('archive.search_placeholder')"
          class="w-full h-11 pl-10 pr-4 rounded-lg bg-muted border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>

    <div class="page-container py-6">
      <!-- Error -->
      <div
        v-if="error"
        class="rounded-xl border border-feedback-error-border bg-feedback-error-bg p-4 text-center text-feedback-error-text"
      >
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading && !seriesList.length" class="flex flex-col gap-3">
        <div
          v-for="i in 5"
          :key="i"
          class="h-20 w-full animate-pulse rounded-xl bg-muted"
        />
      </div>

      <!-- Empty -->
      <div v-else-if="!seriesList.length" class="py-24 text-center">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
        >
          {{ t("archive.no_results") }}
        </p>
      </div>

      <!-- List -->
      <div v-else class="space-y-3">
        <div class="flex items-center justify-between mb-6">
          <p class="font-brand text-2xl font-black text-foreground">
            {{ totalItems }} {{ t("general.results") }}
          </p>
        </div>

        <AdminSeriesListItem
          v-for="series in seriesList"
          :key="series.id"
          :series="series"
          :is-expanded="expandedId === series.id"
          :is-saving="savingIds.has(series.id)"
          :is-deleting="deletingIds.has(series.id)"
          @toggle="toggleExpand(series.id)"
          @save="handleSave"
          @delete="handleDelete(series.id, series.titel.nl)"
          @batch-edit="handleBatchEdit(series.id)"
        />

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pt-8 flex justify-end">
          <ArchivePagination />
        </div>
      </div>
    </div>
  </div>
</template>

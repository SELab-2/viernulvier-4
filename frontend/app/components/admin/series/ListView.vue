<!--
  components/admin/series/ListView.vue
  ======================================
  Admin series list — orchestrates fetching, filtering, and management.
-->

<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import type {
  Series,
  PaginatedResponse,
  ProductionView,
  SeriesView,
} from "@repo/common";
import { useSeriesApi } from "~/composables/useSeriesApi";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import { useSeriesView } from "~/composables/useSeriesView";
import { ROUTES } from "~/utils/routes";
import type { NewSeries } from "~/composables/productions/steps/productionSeries";

const { create, modify, remove, getAllSeriesProductions } = useSeriesApi();
const { selectWholeSeries } = useProductionBatchEdit();
const { t, locale } = useI18n();
const snackbar = useSnackbar();
const router = useRouter();

const {
  searchQuery,
  currentPage,
  totalPages,
  totalItems,
  loading,
  fetchSuggestions,
} = useSeriesView();

// State
const seriesList = ref<Series[]>([]);
const error = ref<string | null>(null);
const expandedId = ref<number | null>(null);

// Pagination
const PAGE_SIZE = 15;

// Action state
const savingIds = ref(new Set<number>());
const deletingIds = ref(new Set<number>());
const creating = ref(false);
const showCreateModal = ref(false);

async function loadSeries() {
  loading.value = true;
  error.value = null;
  try {
    const { getAll: fetchAllSeries } = useSeriesApi();
    const resp = await fetchAllSeries({
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
watch(searchQuery, () => {
  currentPage.value = 1; // Reset to page 1 for new search
  loadSeries();
});

watch(currentPage, (newVal, oldVal) => {
  if (newVal !== oldVal) loadSeries();
});

watch(locale, () => {
  loadSeries();
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
    }
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to save series" });
  } finally {
    savingIds.value.delete(data.id);
  }

  // Re fetch.
  loadSeries();
}

async function handleDelete(id: number, title: string) {
  if (!confirm(t("series.deleteConfirm", { name: title }))) return;

  deletingIds.value.add(id);
  try {
    const resp = await remove(id);
    if (resp.error) {
      snackbar.add({ type: "error", text: resp.error });
    } else {
      snackbar.add({
        type: "success",
        text: t("series.deleteSuccess", { name: title }),
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
      const resp = await getAllSeriesProductions(id, locale.value);
      return (resp as ProductionView[]) || [];
    });
    router.push(ROUTES.admin.productions.batchEdit);
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to prepare batch edit" });
  }
}

async function handleCreate(data: NewSeries) {
  creating.value = true;
  try {
    const resp = await create({
      titel: { nl: data.titel.nl, en: data.titel.en || data.titel.nl },
      description: {
        nl: data.description.nl,
        en: data.description.en || data.description.nl,
      },
    });

    if (resp.error) {
      snackbar.add({ type: "error", text: resp.error });
    } else {
      snackbar.add({
        type: "success",
        text: t("general.createSuccess", "Series created successfully"),
      });
      showCreateModal.value = false;
      await loadSeries();
    }
  } catch (err) {
    snackbar.add({ type: "error", text: "Failed to create series" });
  } finally {
    creating.value = false;
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
    <div class="w-full border-b border-border bg-background">
      <div class="py-5 flex items-stretch">
        <div class="page-container h-12">
          <SearchBar
            v-model="searchQuery"
            :fetch-suggestions="fetchSuggestions"
            :limit="15"
            :scroll-limit="5"
            @update:search="searchQuery = $event"
          />
        </div>
      </div>
    </div>

    <div class="page-container py-6">
      <AdminSeriesCreateModal
        :show="showCreateModal"
        :loading="creating"
        @close="showCreateModal = false"
        @create="handleCreate"
      />

      <div
        v-if="error"
        class="rounded-xl border border-feedback-error-border bg-feedback-error-bg p-4 text-center text-feedback-error-text mb-6"
      >
        {{ error }}
      </div>

      <div class="flex items-center justify-between mb-6">
        <p class="font-brand text-2xl font-black text-foreground">
          {{ totalItems }} {{ t("general.results") }}
        </p>

        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent border-2 border-accent text-accent-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-accent transition"
          @click="showCreateModal = true"
        >
          <Plus :size="15" />
          {{ t("series.create") }}
        </button>
      </div>

      <div v-if="loading && !seriesList.length" class="flex flex-col gap-3">
        <div
          v-for="i in 5"
          :key="i"
          class="h-20 w-full animate-pulse rounded-xl bg-muted"
        />
      </div>

      <div v-else-if="!seriesList.length" class="py-24 text-center">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
        >
          {{ t("series.no_results") }}
        </p>
      </div>

      <div v-else class="space-y-3">
        <AdminSeriesListItem
          v-for="series in seriesList"
          :key="series.id"
          :series="series"
          :is-expanded="expandedId === series.id"
          :is-saving="savingIds.has(series.id)"
          :is-deleting="deletingIds.has(series.id)"
          @toggle="toggleExpand(series.id)"
          @save="handleSave"
          @delete="handleDelete(series.id, series.titel[locale])"
          @batch-edit="handleBatchEdit(series.id)"
        />

        <div v-if="totalPages > 1" class="pt-8 flex w-full">
          <AdminSeriesPagination />
        </div>
      </div>
    </div>
  </div>
</template>

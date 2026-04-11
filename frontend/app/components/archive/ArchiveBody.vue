<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useProductionApi } from "../../composables/useProductionApi";
import type { ProductionView, PaginatedResponse } from "@repo/common";
import { useArchiveView } from "../../composables/useArchiveView";
import ProductionGridViewItem from "../ProductionGridViewItem.vue";
import ProductionListViewItem from "../ProductionListViewItem.vue";

const {
  viewMode,
  searchQuery,
  sortOrder,
  dateFilter,
  tagIds,
  currentPage,
  totalPages,
  loading,
} = useArchiveView();
const { getAll } = useProductionApi();
const { t, locale } = useI18n();

const PAGE_SIZE = 15;

const productions = ref<ProductionView[]>([]);
const totalItems = ref(0);
const error = ref<string | null>(null);

async function loadPage(page: number) {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      productionFilters: {
        titel: searchQuery.value || undefined,
        tag_ids: tagIds.value.length ? tagIds.value : undefined,
        date_after: dateFilter.value.after || undefined,
        date_before: dateFilter.value.before || undefined,
      },
      paginationFilters: {
        page: page - 1,
        limit: PAGE_SIZE,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value },
    });
    if (resp.data) {
      const data = resp.data as PaginatedResponse<ProductionView>;
      productions.value = data.objects;
      totalItems.value = data.totalItems;
      totalPages.value = Math.max(1, Math.ceil(data.totalItems / PAGE_SIZE));
    } else {
      error.value = resp.error ?? "Failed to load productions";
    }
  } catch (err) {
    error.value = "An unexpected error occurred";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => loadPage(1));
watch(currentPage, (page) => loadPage(page));
watch(locale, () => {
  currentPage.value = 1;
  loadPage(1);
});
watch(sortOrder, () => {
  currentPage.value = 1;
  loadPage(1);
});
watch(
  dateFilter,
  () => {
    currentPage.value = 1;
    loadPage(1);
  },
  { deep: true },
);
watch(
  tagIds,
  () => {
    currentPage.value = 1;
    loadPage(1);
  },
  { deep: true },
);
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadPage(1);
  }, 350);
});
</script>

<template>
  <section class="w-full bg-background">
    <div class="max-w-5xl mx-auto px-4 py-6">
      <!-- Results count + pagination -->
      <div class="flex items-center justify-between mb-6">
        <p
          v-if="!loading && totalItems > 0"
          class="font-brand text-2xl font-black text-foreground"
        >
          {{ t("archive.total_results", { total: totalItems }) }}
        </p>
        <div
          v-else-if="loading"
          class="h-7 w-36 bg-muted rounded animate-pulse"
        />

        <ArchivePagination />
      </div>

      <!-- Error state -->
      <div
        v-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 px-4 py-8 text-sm text-rose-600 dark:text-rose-400 text-center"
      >
        {{ error }}
      </div>

      <!-- Skeleton -->
      <template v-else-if="loading">
        <div
          :class="
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'flex flex-col gap-3'
          "
        >
          <div
            v-for="n in PAGE_SIZE"
            :key="n"
            class="rounded-xl border border-card-border bg-card overflow-hidden animate-pulse"
            :class="viewMode === 'list' ? 'h-24' : ''"
          >
            <div
              v-if="viewMode === 'grid'"
              class="w-full aspect-video bg-muted"
            />
            <div
              class="p-4 flex gap-3"
              :class="viewMode === 'grid' ? 'flex-col' : 'items-center'"
            >
              <div
                v-if="viewMode === 'list'"
                class="w-16 h-16 bg-muted rounded-lg shrink-0"
              />
              <div class="flex flex-col gap-2 flex-1">
                <div class="h-4 w-3/4 bg-muted rounded" />
                <div class="h-3 w-1/2 bg-muted rounded" />
                <div class="h-5 w-1/3 bg-muted rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!loading && productions.length === 0"
        class="py-24 text-center"
      >
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
        >
          {{ t("archive.no_results") }}
        </p>
        <p
          class="font-brand font-black text-[12px] uppercase tracking-widest text-muted-foreground"
        >
          {{ t("archive.no_results_sub") }}
        </p>
      </div>

      <!-- Grid / list -->
      <div
        v-else
        :class="
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6'
            : 'flex flex-col gap-3 mb-6'
        "
      >
        <component
          :is="
            viewMode === 'grid'
              ? ProductionGridViewItem
              : ProductionListViewItem
          "
          v-for="production in productions"
          :key="production.id"
          :productionView="production"
        />
      </div>

      <!-- Bottom controls -->
      <div class="flex items-center justify-between mt-6">
        <ArchivePageJumper />
        <ArchivePagination />
      </div>
    </div>
  </section>
</template>

<style scoped></style>

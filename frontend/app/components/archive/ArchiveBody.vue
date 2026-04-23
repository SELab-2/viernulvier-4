<!--
ArchiveBody.vue

Main container component for the archive page.
Responsible for:
- Fetching paginated productions from the API
- Reacting to filters (search, tags, date, sorting, language)
- Handling loading, error, and empty states
- Rendering results in grid or list view

Uses:
- useArchiveView: shared archive state (filters, pagination, view mode)
- useProductionApi: API communication
TODO: The pagination logic is not what I want to be defined here and should be changed in the future.
      It should be defined elsewhere to be more clear and to prevent bugs that are hard to find.
-->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useProductionApi } from "../../composables/useProductionApi";
import type { ProductionView, PaginatedResponse } from "@repo/common";
import { useArchiveView } from "../../composables/useArchiveView";
import ProductionGridViewItem from "../ProductionGridViewItem.vue";
import ProductionListViewItem from "../ProductionListViewItem.vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTES } from "~/utils/routes";

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean;
  }>(),
  {
    isAdmin: false,
  },
);

const baseRoute = computed(() =>
  props.isAdmin ? ROUTES.admin.productions.base : ROUTES.productions.base,
);

const route = useRoute();
const router = useRouter();

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

const PAGE_SIZE = 15; // number of items per page

const productions = ref<ProductionView[]>([]);
const totalItems = ref(0);
const error = ref<string | null>(null);

async function loadPage(page: number) {
  loading.value = true;
  error.value = null;

  let targetedPage = Math.max(1, page);

  try {
    const resp = await getAll({
      productionFilters: {
        titelOrArtist: searchQuery.value || undefined,
        tag_ids: tagIds.value.length ? tagIds.value : undefined,
        after: dateFilter.value.after || undefined,
        before: dateFilter.value.before, // before filter will always contain a value (today's date)
        is_suggestion: false,
      },
      paginationFilters: {
        page: targetedPage - 1, // backend uses 0-based pagination
        limit: PAGE_SIZE,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value },
    });

    if (resp.data) {
      const data = resp.data as PaginatedResponse<ProductionView>;
      productions.value = data.objects;
      totalItems.value = data.totalItems;
      const calculatedTotalPages = Math.max(
        1,
        Math.ceil(data.totalItems / PAGE_SIZE),
      );
      totalPages.value = calculatedTotalPages;

      if (targetedPage > calculatedTotalPages) {
        currentPage.value = calculatedTotalPages;
        await loadPage(calculatedTotalPages);
        return;
      }

      if (currentPage.value !== targetedPage) {
        currentPage.value = targetedPage;
      }
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

function resetAndLoad() {
  if (currentPage.value === 1) {
    loadPage(1);
  } else {
    currentPage.value = 1;
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
});

onMounted(() => {
  if (props.isAdmin) {
    viewMode.value = "list";
  }
  const pageFromUrl = parseInt(route.query.page as string) || 1;
  const safePage = Math.max(1, pageFromUrl);
  currentPage.value = safePage;
  loadPage(safePage);
});

watch(
  () => route.query.page,
  (newPage) => {
    if (route.path !== baseRoute.value) return;

    const pageNum = parseInt(newPage as string) || 1;

    if (currentPage.value !== pageNum) {
      currentPage.value = pageNum;
    }

    loadPage(pageNum);
  },
  { immediate: false },
);

// Reload when pagination changes
watch(currentPage, (newPage) => {
  if (route.path !== baseRoute.value) return;

  if (newPage.toString() !== route.query.page) {
    router.push({
      query: { ...route.query, page: newPage.toString() },
    });
  }
});

// Reset + reload when filters change
watch(locale, resetAndLoad);
watch(sortOrder, resetAndLoad);
watch(dateFilter, resetAndLoad, { deep: true });
watch(tagIds, resetAndLoad, { deep: true });

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    resetAndLoad();
  }, 350);
});
</script>

<template>
  <section class="w-full bg-background">
    <div class="page-container py-6">
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
      <ArchiveSkeleton
        v-else-if="loading"
        :viewMode="viewMode"
        :pageSize="PAGE_SIZE"
      />

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
            props.isAdmin
              ? ProductionListViewItem
              : viewMode === 'grid'
                ? ProductionGridViewItem
                : ProductionListViewItem
          "
          v-for="production in productions"
          :key="production.id"
          :productionView="production"
          :is-admin="props.isAdmin"
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

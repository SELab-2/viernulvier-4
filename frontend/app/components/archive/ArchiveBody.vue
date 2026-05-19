<!--
  ArchiveBody.vue

  Main container component for the archive page.
  Responsible for:
  - Fetching paginated productions from the API
  - Reacting to filters (search, tags, date, sorting, language)
  - Handling loading, error, and empty states
  - Rendering results in grid or list view
  - (Admin) Batch edit mode: selection, visual edit-mode indicator, floating panel

Uses:
- useArchiveView: shared archive state (filters, pagination, view mode)
- useProductionApi: API communication
- useProductionBatchEdit: batch selection state
-->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useProductionApi } from "../../composables/useProductionApi";
import type { ProductionView, PaginatedResponse } from "@repo/common";
import { useArchiveView } from "../../composables/useArchiveView";
import ProductionGridViewItem from "../ProductionGridViewItem.vue";
import ProductionListViewItem from "../ProductionListViewItem.vue";
import { useRoute, useRouter } from "vue-router";
import { ROUTES } from "~/utils/routes";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import { Plus, Layers, FileText } from "lucide-vue-next";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useGalleryApi } from "~/composables/media/useGalleryApi";

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
const { getAll, remove: removeProduction } = useProductionApi();
const { deleteMedia } = useStorageApi();
const { remove: removeCrop } = useCropApi();
const { remove: removeItem } = useItemApi();
const { remove: removeGallery } = useGalleryApi();
const { t, locale } = useI18n();
const snackbar = useSnackbar();

const {
  isBatchEditMode,
  toggleBatchEditMode,
  disableBatchEditMode,
  selectWholeSeries,
  selectedCount,
} = useProductionBatchEdit();

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
  // Only reset batch edit mode when leaving to somewhere other than the
  // batch edit page. If the user clicked "Proceed", we must keep the
  // selection alive so the batch edit page can read it from the singleton.
  if (router.currentRoute.value.path !== ROUTES.admin.productions.batchEdit) {
    disableBatchEditMode();
  }
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

/**
 * Deletion
 */

function showSnackbarError(message: string) {
  snackbar.add({
    type: "error",
    text: t("admin-productions.deleteError") + message,
  });
}

function showSnackbarSuccess(message: string) {
  snackbar.add({
    type: "success",
    text: message,
  });
}

/**
 * Reacts to the press of a delete button.
 *
 * NOTE: Currently when a production is deleted it's corresponding MEDIA is also removed.
 * Because we don't have any frontend functionality to link media from other productions to each other this is safe.
 * A Print gallery is left as is because they also show up on the prints page.
 * @param production The production we want to delete.
 */
async function handleDeleteProduction(
  production: ProductionView,
  gallery: GalleryWithItems<ItemViewWithCrops> | null,
) {
  // Check whether the user ACTUALLY wants to perform the delete.
  const confirmed = confirm(
    t("admin-productions.deleteConfirm", {
      production: production.titel,
    }),
  );
  if (!confirmed) return;

  // Perform the various deletes.
  await Promise.all([
    deleteProduction(production),
    deleteGallery(gallery),
    // NOTE: Events are automatically deleted by the DB if their production is removed.
  ]);

  // Reload the page
  resetAndLoad();
  showSnackbarSuccess(
    t("admin-productions.deleteSuccess", {
      production: production.titel,
    }),
  );
}

/**
 * Deletes a production (and it's events) from the database.
 * @param production_id The ID of the production.
 */
async function deleteProduction(production: ProductionView) {
  const response = await removeProduction(production.id);
  if (response.error) {
    showSnackbarError(response.error);
  }
}

/**
 * Deletes a full gallery and it's assets from the database/server.
 * @param gallery_id The ID of the gallery.
 */
async function deleteGallery(
  gallery: GalleryWithItems<ItemViewWithCrops> | null,
) {
  if (!gallery) return; // If no gallery we can just skip this step.

  // Start by deleting the images from the server.
  // In the same (sub)-loop we can delete crops and items.
  for (const item of gallery.items) {
    for (const crop of Object.values(item.crops)) {
      // Remove the image itself.
      const responseMedia = await deleteMedia(crop.url);
      if (responseMedia.error) {
        showSnackbarError(responseMedia.error);
      }

      // Remove the crop.
      const responseCrop = await removeCrop(crop.id);
      if (responseCrop.error) {
        showSnackbarError(responseCrop.error);
      }
    }

    // Remove the item itself when all it's crops are removed.
    const responseItem = await removeItem(item.id);
    if (responseItem.error) {
      showSnackbarError(responseItem.error);
    }
  }

  // Lastly remove the gallery.
  const responseGallery = await removeGallery(gallery.id);
  if (responseGallery.error) {
    showSnackbarError(responseGallery.error);
  }
}
</script>

<template>
  <section class="w-full bg-background relative">
    <div class="page-container py-6">
      <!-- Results count + pagination -->
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6"
      >
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

        <ArchivePagination v-if="!isAdmin" />
        <!-- Admin toolbar -->
        <div v-else class="flex flex-wrap gap-2">
          <!-- Batch edit pill toggle -->
          <button
            class="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 font-brand font-black text-[11px] uppercase tracking-widest leading-none transition-colors duration-200"
            :class="
              isBatchEditMode
                ? 'border-primary/30 bg-primary/5 text-foreground'
                : 'border-border bg-transparent text-foreground hover:border-primary/30'
            "
            @click="toggleBatchEditMode"
          >
            <Layers :size="13" class="text-muted-foreground shrink-0" />
            {{ t("admin-productions.batch.toggle") }}
            <!-- Pill track -->
            <span
              class="relative inline-flex items-center w-9 h-5 rounded-full transition-colors duration-300 shrink-0"
              :class="isBatchEditMode ? 'bg-emerald-500' : 'bg-rose-400'"
            >
              <!-- Sliding knob -->
              <span
                class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                :class="isBatchEditMode ? 'left-[18px]' : 'left-0.5'"
              />
            </span>
          </button>

          <!-- CSV imports -->
          <NuxtLink
            :to="ROUTES.admin.productions.csvImports"
            class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border-2 border-secondary text-secondary-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-secondary transition"
          >
            <FileText :size="15" />
            {{ t("admin.csvImport.label") }}
          </NuxtLink>
          <!-- New production -->
          <NuxtLink
            :to="ROUTES.admin.productions.create"
            class="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent-fixed border-2 border-accent-fixed text-accent-fixed-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-accent transition"
          >
            <Plus :size="15" />
            {{ t("admin-productions.new") }}
          </NuxtLink>
        </div>
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
          :is-batch-mode="props.isAdmin && isBatchEditMode"
          @delete="handleDeleteProduction"
        />
      </div>

      <!-- Bottom controls -->
      <div class="flex items-center justify-between mt-6">
        <ArchivePageJumper />
        <ArchivePagination />
      </div>
    </div>

    <!-- Floating batch panel (only visible in admin batch mode) -->
    <ArchiveBatchSelectedPanel v-if="isAdmin && isBatchEditMode" />
  </section>
</template>

<style scoped></style>

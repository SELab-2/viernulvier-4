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
      By pagination logic I mean the logic that handles the parameters that are used to know on witch page the user is.
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

import { Plus, Edit2, FileText } from "lucide-vue-next";
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

        <ArchivePagination v-if="!isAdmin" />
        <div v-else class="flex gap-3">
          <NuxtLink
            :to="ROUTES.admin.productions.editTags"
            class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary border-2 border-primary text-primary-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-primary transition"
          >
            <Edit2 :size="15" />
            {{ t("admin-productions.editTags") }}
          </NuxtLink>
          <NuxtLink
            :to="ROUTES.admin.productions.csvImports"
            class="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary border-2 border-secondary text-secondary-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-secondary transition"
          >
            <FileText :size="15" />
            {{ t("admin.csvImport.label") }}
          </NuxtLink>

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
          @delete="handleDeleteProduction"
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

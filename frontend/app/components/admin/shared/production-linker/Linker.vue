<!--
  components/admin/shared/production-linker/Linker.vue
  ======================================================
  Generic card that lets the editor link an entity (blog, print, etc.)
  to one or more productions.
-->

<script setup lang="ts">
import type { PaginatedResponse, ProductionView } from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";

const props = defineProps<{
  entityId?: number | null;
  type: "blog" | "print";
}>();

const { t, locale } = useI18n();
const { getAll, linkBlog, unlinkBlog, getPrintsGallery, linkMedia } =
  useProductionApi();
const galleryApi = useGalleryApi();

const hasEntityId = computed(() => typeof props.entityId === "number");

const search = ref("");
const searchResults = ref<ProductionView[]>([]);
const hasMore = ref(false);
const currentPage = ref(0);
const searching = ref(false);

const linking = ref<number | null>(null);
const unlinking = ref<number | null>(null);

const linkedProductions = ref<ProductionView[]>([]);
const linkedProductionIds = computed(
  () => new Set(linkedProductions.value.map((p) => p.id)),
);

const storageKey = computed(() =>
  hasEntityId.value ? `vnv-${props.type}-linked-prods-${props.entityId}` : null,
);

function persist() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify(linkedProductions.value),
    );
  } catch {
    // Storage may be unavailable.
  }
}

async function restoreFromStorage() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    const raw = localStorage.getItem(storageKey.value);
    if (raw) linkedProductions.value = JSON.parse(raw) as ProductionView[];
  } catch {
    // Ignore parse errors.
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function runSearch(reset = true) {
  if (!hasEntityId.value || !search.value.trim()) {
    searchResults.value = [];
    hasMore.value = false;
    return;
  }

  if (reset) {
    currentPage.value = 0;
    searchResults.value = [];
    hasMore.value = false;
  }

  searching.value = true;
  try {
    const resp = await getAll({
      productionFilters: {
        titelOrArtist: search.value.trim(),
        is_suggestion: true,
      },
      paginationFilters: {
        page: currentPage.value,
        limit: 8,
        descending: true,
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    const data = resp.data as PaginatedResponse<ProductionView> | null;
    const items = data?.objects ?? [];

    if (reset) searchResults.value = items;
    else searchResults.value.push(...items);

    hasMore.value = items.length >= 8;
    if (items.length) currentPage.value += 1;
  } catch {
    hasMore.value = false;
  } finally {
    searching.value = false;
  }
}

watch(search, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val.trim()) {
    searchResults.value = [];
    hasMore.value = false;
    return;
  }
  searchTimer = setTimeout(() => runSearch(true), 250);
});

async function handleLink(production: ProductionView) {
  if (!hasEntityId.value || linkedProductionIds.value.has(production.id))
    return;
  linking.value = production.id;
  try {
    if (props.type === "blog") {
      await linkBlog(production.id, props.entityId!);
    } else {
      let printGallery = await getPrintsGallery(production.id);
      if (!printGallery) {
        const res = await galleryApi.create({
          name: `production-${production.id}-prints`,
          type: "prints",
        });
        if (!res.data) throw new Error("Failed to create print gallery");
        printGallery = { ...res.data, items: [] };
        await linkMedia(production.id, printGallery.id);
      }
      await galleryApi.linkPrintToGallery(printGallery.id, props.entityId!);
    }
    linkedProductions.value = [production, ...linkedProductions.value];
    persist();
  } catch (err) {
    console.error(`Failed to link production to ${props.type}:`, err);
  } finally {
    linking.value = null;
  }
}

async function handleUnlink(productionId: number) {
  if (!hasEntityId.value) return;
  unlinking.value = productionId;
  try {
    if (props.type === "blog") {
      await unlinkBlog(productionId, props.entityId!);
    } else {
      const printGallery = await getPrintsGallery(productionId);
      if (printGallery) {
        await galleryApi.unlinkPrintFromGallery(
          printGallery.id,
          props.entityId!,
        );
      }
    }
    linkedProductions.value = linkedProductions.value.filter(
      (p) => p.id !== productionId,
    );
    persist();
  } catch (err) {
    console.error(`Failed to unlink production from ${props.type}:`, err);
  } finally {
    unlinking.value = null;
  }
}

onMounted(restoreFromStorage);

const baseKey = computed(() =>
  props.type === "blog" ? "admin.blogs" : "prints",
);
const titleKey = computed(() => `${baseKey.value}.linkedProductions`);
const subtitleKey = computed(() => `${baseKey.value}.linkedProductionsHint`);
</script>

<template>
  <FormSectionsSectionCard :title="t(titleKey)" :subtitle="t(subtitleKey)">
    <div class="p-5 space-y-4">
      <AdminSharedProductionLinkerLockedHint
        v-if="!hasEntityId"
        :type="props.type"
      />

      <template v-else>
        <AdminSharedProductionLinkerSearchDropdown
          v-model:search="search"
          :type="props.type"
          :search-results="searchResults"
          :linked-ids="linkedProductionIds"
          :searching="searching"
          :has-more="hasMore"
          :linking-id="linking"
          @link="handleLink"
          @load-more="runSearch(false)"
        />

        <AdminSharedProductionLinkerLinkedList
          :type="props.type"
          :productions="linkedProductions"
          :unlinking-id="unlinking"
          @unlink="handleUnlink"
        />
      </template>
    </div>
  </FormSectionsSectionCard>
</template>

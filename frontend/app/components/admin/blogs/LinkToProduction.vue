<!--
  components/admin/blogs/LinkToProduction.vue
  =============================================
  Card that lets the editor link this blog post to one or more productions.

  Architecture:
  ┌─ LinkToProduction (this file) ──────────────────────────────────────────┐
  │  Owns: search state, linked-productions list, API calls, localStorage   │
  │        persistence.                                                     │
  │                                                                         │
  │  ┌── AdminBlogsLinkLockedHint ─────────────────────────────────────┐    │
  │  │  Shown when no blogId is available (blog not saved yet)         │    │
  │  └─────────────────────────────────────────────────────────────────┘    │
  │                                                                         │
  │  ┌── AdminBlogsLinkLinkedList ─────────────────────────────────────┐    │
  │  │  Scrollable list of already-linked productions + Unlink button  │    │
  │  └─────────────────────────────────────────────────────────────────┘    │
  │                                                                         │
  │  ┌── AdminBlogsLinkSearchDropdown ────────────────────────────────┐     │
  │  │  Search input + autocomplete dropdown + Link button per row    │     │
  │  └────────────────────────────────────────────────────────────────┘     │
  └─────────────────────────────────────────────────────────────────────────┘

  Props:
  - blogId     number | null  — undefined or null when the blog is not saved yet
  - galleryId  number | null  — not used here, exposed for parent symmetry

  The linked-productions list is persisted in localStorage so a page refresh
  does not lose the session state.
-->

<script setup lang="ts">
import type { PaginatedResponse, ProductionView } from "@repo/common";

const props = defineProps<{
  blogId?: number | null;
  galleryId?: number | null;
}>();

const { t, locale } = useI18n();
const { getAll, linkBlog, unlinkBlog } = useProductionApi();

// Whether a valid blogId is present (determines locked vs unlocked UI).
const hasBlogId = computed(() => typeof props.blogId === "number");

// Search state.
const search = ref("");
const searchResults = ref<ProductionView[]>([]);
const hasMore = ref(false);
const currentPage = ref(0);
const searching = ref(false);

// Link / unlink operation state.
const linking = ref<number | null>(null);
const unlinking = ref<number | null>(null);

// The set of linked productions maintained for the current session.
const linkedProductions = ref<ProductionView[]>([]);

const linkedProductionIds = computed(
  () => new Set(linkedProductions.value.map((p) => p.id)),
);

// localStorage persistence key — unique per blog so different blogs do not
// share the same session data.
const storageKey = computed(() =>
  hasBlogId.value ? `vnv-blog-linked-prods-${props.blogId}` : null,
);

function persist() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    localStorage.setItem(
      storageKey.value,
      JSON.stringify(linkedProductions.value),
    );
  } catch {
    // Storage may be unavailable in certain browser configurations.
  }
}

async function restoreFromStorage() {
  if (!import.meta.client || !storageKey.value) return;
  try {
    const raw = localStorage.getItem(storageKey.value);
    if (raw) linkedProductions.value = JSON.parse(raw) as ProductionView[];
  } catch {
    // Ignore parse errors — the list simply starts empty.
  }
}

// Debounced search triggered by the watcher below.
let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function runSearch(reset = true) {
  if (!hasBlogId.value || !search.value.trim()) {
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
      productionFilters: { titelOrArtist: search.value.trim() },
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

// Debounce the search so we don't fire a request on every keystroke.
watch(search, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!val.trim()) {
    searchResults.value = [];
    hasMore.value = false;
    return;
  }
  searchTimer = setTimeout(() => runSearch(true), 250);
});

// Link a production to this blog post.
async function handleLink(production: ProductionView) {
  if (!hasBlogId.value || linkedProductionIds.value.has(production.id)) return;
  linking.value = production.id;
  try {
    await linkBlog(production.id, props.blogId);
    linkedProductions.value = [production, ...linkedProductions.value];
    persist();
  } catch (err) {
    console.error("Failed to link production:", err);
  } finally {
    linking.value = null;
  }
}

// Unlink a production from this blog post.
async function handleUnlink(productionId: number) {
  if (!hasBlogId.value) return;
  unlinking.value = productionId;
  try {
    await unlinkBlog(productionId, props.blogId);
    linkedProductions.value = linkedProductions.value.filter(
      (p) => p.id !== productionId,
    );
    persist();
  } catch (err) {
    console.error("Failed to unlink production:", err);
  } finally {
    unlinking.value = null;
  }
}

onMounted(restoreFromStorage);
</script>

<template>
  <AdminBlogsSectionCard
    :title="t('admin.blogs.linkedProductions')"
    :subtitle="t('admin.blogs.linkedProductionsHint')"
  >
    <div class="p-5 space-y-4">
      <!-- Locked state — shown before the blog is first saved -->
      <AdminBlogsLinkLockedHint v-if="!hasBlogId" />

      <template v-else>
        <!-- List of productions linked during this session -->
        <AdminBlogsLinkLinkedList
          :productions="linkedProductions"
          :unlinking-id="unlinking"
          @unlink="handleUnlink"
        />

        <!-- Search input + autocomplete dropdown -->
        <AdminBlogsLinkSearchDropdown
          v-model:search="search"
          :search-results="searchResults"
          :linked-ids="linkedProductionIds"
          :searching="searching"
          :has-more="hasMore"
          :linking-id="linking"
          @link="handleLink"
          @load-more="runSearch(false)"
        />
      </template>
    </div>
  </AdminBlogsSectionCard>
</template>

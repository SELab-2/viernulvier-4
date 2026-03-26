<!--
  pages/stories/index.vue
  =======================
  This file implements the Stories (Blogs) archive overview page.
  It renders all blog posts fetched from the backend API in a chronological
  timeline grouped first by year then by month.

  Pagination strategy
  -------------------
  The backend returns LIMIT (20) items per request.  An IntersectionObserver
  watches a 1 px sentinel element below the list.  When it enters the viewport
  `page` is incremented and the next slice is appended to `stories`.
  `hasMore = stories.length < totalItems` prevents over-fetching.
  Changing the sort order calls fetchPage(true) which resets to page 0 and
  replaces the current list entirely.

  i18n
  ----
  All user-visible strings use useI18n() with keys under stories.* in
  /i18n/en.json and /i18n/nl.json.  Both files must have matching key sets.

  Components used
  ---------------
  StoriesHeader  — sticky top bar (dark-mode + language toggles)
  StoryToolbar   — sort / filter controls
  StorySkeleton  — animated skeleton while the first page loads
  StoryTimeline  — year/month grouping with horizontal year-nav strip
-->

<script lang="ts" setup>
import type { Blog, BlogView, PaginatedResponse } from "@repo/common";
import StoriesHeader from "~/components/blogs/StoriesHeader.vue";
import StoryToolbar from "~/components/blogs/StoryToolbar.vue";
import StorySkeleton from "~/components/blogs/StorySkeleton.vue";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";

const { t } = useI18n();
const { getAll } = useBlogApi();

// ── Sort / filter state ──────────────────────────────────────────────────────
const sortOrder = ref<"newest" | "oldest">("newest");
const showFilter = ref(false);

// ── Pagination state ─────────────────────────────────────────────────────────
/** Number of items fetched per request; must be ≤ the backend page-size cap. */
const LIMIT = 20;
const page = ref(0);
const totalItems = ref(0);
const stories = ref<Array<Blog | BlogView>>([]);
const pending = ref(false);
const isLoadingMore = ref(false);
const fetchError = ref<Error | null>(null);

/** True when the server still has items we haven't loaded yet. */
const hasMore = computed(() => stories.value.length < totalItems.value);

// ── Response normaliser ──────────────────────────────────────────────────────
/**
 * useApi() may return either a raw PaginatedResponse or one wrapped in
 * { data: PaginatedResponse }.  This handles both shapes uniformly.
 */
const unwrap = (result: unknown): PaginatedResponse<Blog | BlogView> | null => {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
};

// ── Fetch ────────────────────────────────────────────────────────────────────
/**
 * Load one page of stories.
 * @param reset  true → clear the list and start from page 0 again.
 *               false → append the next page (caller must already have
 *               incremented `page.value`).
 */
const fetchPage = async (reset = false) => {
  if (reset) {
    page.value = 0;
    stories.value = [];
    pending.value = true;
    fetchError.value = null;
  } else {
    if (isLoadingMore.value || !hasMore.value) return;
    isLoadingMore.value = true;
  }

  try {
    const raw = await getAll({
      paginationFilters: { limit: LIMIT, page: page.value, descending: true },
    });
    const paged = unwrap(raw);
    totalItems.value = paged?.totalItems ?? 0;
    const items = paged?.objects ?? [];
    if (reset) stories.value = items;
    else stories.value.push(...items);
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value = false;
    isLoadingMore.value = false;
  }
};

// Re-fetch from scratch when sort order changes.
watch(sortOrder, () => fetchPage(true));
onMounted(() => fetchPage(true));

// ── Infinite-scroll sentinel ─────────────────────────────────────────────────
/**
 * A 1 px element at the bottom of the list.  rootMargin: "400px" pre-fetches
 * the next page before the user reaches the very bottom.
 */
const sentinel = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

watch(sentinel, (el) => {
  io?.disconnect();
  if (!el) return;
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoadingMore.value) {
        page.value++;
        fetchPage(false);
      }
    },
    { rootMargin: "400px" },
  );
  io.observe(el);
});

onUnmounted(() => io?.disconnect());
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#151821] text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <!-- Sticky header with dark-mode and language toggles -->
    <StoriesHeader />

    <!-- Sort / filter toolbar (sticky below the header) -->
    <StoryToolbar
      v-model:sort-order="sortOrder"
      v-model:show-filter="showFilter"
      :total-items="totalItems"
      :loaded="stories.length"
    />

    <main class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">

      <!-- First-load skeleton -->
      <StorySkeleton v-if="pending" />

      <!-- Error state -->
      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20">
          Error
        </p>
        <p class="font-brand font-black text-[10px] uppercase tracking-widest text-red-400">
          {{ fetchError.message }}
        </p>
        <button
          class="mt-4 px-6 py-3 border font-brand font-black text-[11px] uppercase tracking-widest transition-all border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
          @click="fetchPage(true)"
        >
          {{ t("stories.retry") }}
        </button>
      </div>

      <!-- Main timeline -->
      <template v-else>
        <StoryTimeline
          :stories="stories"
          :sort-order="sortOrder"
        />

        <!-- Sentinel triggers the IntersectionObserver for the next page -->
        <div ref="sentinel" class="h-1" aria-hidden="true" />

        <!-- Loading-more spinner (subsequent pages) -->
        <div v-if="isLoadingMore" class="flex items-center justify-center gap-3 py-10 text-muted-foreground">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span class="font-brand font-black text-[10px] uppercase tracking-widest">
            {{ t("stories.loading") }}
          </span>
        </div>

        <!-- End-of-list indicator when everything has been loaded -->
        <div v-else-if="!hasMore && stories.length > 0" class="flex items-center gap-4 py-10">
          <div class="flex-1 h-px bg-border" />
          <span class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground shrink-0">
            {{ stories.length }} {{ t("stories.results") }}
          </span>
          <div class="flex-1 h-px bg-border" />
        </div>
      </template>

    </main>
  </div>
</template>
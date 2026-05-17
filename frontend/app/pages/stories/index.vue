<!--
  pages/stories/index.vue
  ========================
  Stories overview page.

  - Fetches the oldest blog once (ascending, limit 1) to seed the Calendar.
  - Loads stories in pages of 20. totalItems comes from the API response and
    represents the total DB row-count matching the active filters — not the
    page size — so `stories.length < totalItems` reliably drives infinite scroll.
  - All filter state (sort, search, date) flows down into every getAll() call.
-->
<script lang="ts" setup>
import type { BlogView, FilterBlog, PaginatedResponse } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogView } from "~/composables/blogs/useBlogView";

const { t, locale } = useI18n();
const { getAll } = useBlogApi();
const { sortOrder, searchQuery, dateFilter } = useBlogView();

//Oldest date (one-off fetch for Calendar "oldest" mode)

const oldestDate = ref("");
const newestDate = ref("");

async function fetchDateBounds() {
  try {
    const [oldestRaw, newestRaw] = await Promise.all([
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: false },
        languageFilters: { lang: locale.value as "nl" | "en" },
      }),
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: true },
        languageFilters: { lang: locale.value as "nl" | "en" },
      }),
    ]);
    const first = unwrap(oldestRaw)?.objects?.[0] as BlogView | undefined;
    const last = unwrap(newestRaw)?.objects?.[0] as BlogView | undefined;
    if (first?.created_at) oldestDate.value = first.created_at.slice(0, 10);
    if (last?.created_at) newestDate.value = last.created_at.slice(0, 10);
  } catch {
    /* non-critical */
  }
}

const LIMIT = 20;
const page = ref(0);
const totalItems = ref(0); // total DB rows for the current query — drives infinite scroll
const stories = ref<BlogView[]>([]);
const pending = ref(false);
const isLoadingMore = ref(false);
const fetchError = ref<Error | null>(null);

const hasMore = computed(() => stories.value.length < totalItems.value);

function unwrap(result: unknown): PaginatedResponse<BlogView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
}

async function loadPage(reset = false) {
  if (!reset && (isLoadingMore.value || !hasMore.value)) return;

  if (reset) {
    page.value = 0;
    stories.value = [];
    pending.value = true;
    fetchError.value = null;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const raw = await getAll({
      paginationFilters: {
        page: page.value,
        limit: LIMIT,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      blogFilters: {
        is_suggestion: false, // This is not a suggestion.
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(dateFilter.value.after ? { after: dateFilter.value.after } : {}),
        ...(dateFilter.value.before ? { before: dateFilter.value.before } : {}),
      },
    });

    const paged = unwrap(raw);
    totalItems.value = paged?.totalItems ?? 0;
    const items = (paged?.objects ?? []) as BlogView[];

    if (reset) stories.value = items;
    else stories.value.push(...items);
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value = false;
    isLoadingMore.value = false;
  }
}

watch([sortOrder, searchQuery, dateFilter, locale], () => loadPage(true), {
  deep: true,
});

//Infinite scroll

const sentinel = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

watch(sentinel, (el) => {
  io?.disconnect();
  if (!el) return;
  io = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoadingMore.value) {
        page.value++;
        loadPage(false);
      }
    },
    { rootMargin: "400px" },
  );
  io.observe(el);
});

onMounted(async () => {
  await fetchDateBounds();
  await loadPage(true);
});

onUnmounted(() => {
  io?.disconnect();
});
</script>

<template>
  <div
    class="min-h-screen bg-background text-gray-900 dark:text-gray-100 transition-colors duration-200"
  >
    <PageHeader
      :title="t('stories.title')"
      :description="t('stories.headerDescription')"
    />

    <!--
      StoryToolbar contains the Calendar panel inline (in-flow).
      When the calendar opens it expands the toolbar element downward,
      pushing <main> down naturally — no overlap.
    -->
    <BlogsStoryToolbar
      v-model:sort-order="sortOrder"
      :story-titles="[]"
      :oldest-date="oldestDate"
      :newest-date="newestDate"
      :date-filter="dateFilter"
      @update:search="searchQuery = $event"
      @update:date-filter="dateFilter = $event"
    />

    <main class="page-container py-8 sm:py-12">
      <BlogsStorySkeleton v-if="pending" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p
          class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20"
        >
          {{ t("stories.noStories") }}
        </p>
        <p
          class="font-brand font-black text-[10px] uppercase tracking-widest text-red-400"
        >
          {{ fetchError.message }}
        </p>
        <button
          class="mt-4 px-6 py-3 border font-brand font-black text-[11px] uppercase tracking-widest transition-all border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
          @click="loadPage(true)"
        >
          {{ t("stories.retry") }}
        </button>
      </div>

      <template v-else>
        <BlogsStoryTimeline :stories="stories" :sort-order="sortOrder" />

        <div ref="sentinel" class="h-1" aria-hidden="true" />

        <div
          v-if="isLoadingMore"
          class="flex items-center justify-center gap-3 py-10 text-muted-foreground"
        >
          <svg
            class="w-4 h-4 animate-spin"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span
            class="font-brand font-black text-[10px] uppercase tracking-widest"
          >
            {{ t("stories.loading") }}
          </span>
        </div>
      </template>
    </main>
    <BlogsScrollToTop />
  </div>
</template>

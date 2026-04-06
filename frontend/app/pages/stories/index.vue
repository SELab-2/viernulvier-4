<!--
  pages/stories/index.vue
  =====================
  This file implements the main stories overview page.

  It is responsible for:
  - Exposing sort order and year filter controls to the toolbar and timeline.
  - Rendering the appropriate state: loading skeleton, error with retry, or
    the live StoryTimeline with its infinite-scroll sentinel.
-->
<script lang="ts" setup>
import type { BlogView, PaginatedResponse } from "@repo/common";
import StoriesHeader from "~/components/blogs/StoriesHeader.vue";
import StoryToolbar from "~/components/blogs/StoryToolbar.vue";
import StorySkeleton from "~/components/blogs/StorySkeleton.vue";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";
import ScrollToTop from "~/components/blogs/ScrollToTop.vue";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { t, locale } = useI18n();
const { getAll } = useBlogApi();

const sortOrder    = ref<"newest" | "oldest">("newest");
const searchQuery  = ref("");

const LIMIT         = 20;
const page          = ref(0);
const totalItems    = ref(0);
const stories       = ref<BlogView[]>([]);
const pending       = ref(false);
const isLoadingMore = ref(false);
const fetchError    = ref<Error | null>(null);

const hasMore = computed(() => stories.value.length < totalItems.value);

const unwrap = (result: unknown): PaginatedResponse<BlogView> | null => {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
};

const fetchPage = async (reset = false) => {
  if (reset) {
    page.value       = 0;
    stories.value    = [];
    pending.value    = true;
    fetchError.value = null;
  } else {
    if (isLoadingMore.value || !hasMore.value) return;
    isLoadingMore.value = true;
  }

  try {
    const lang = locale.value as "nl" | "en";
    const raw = await getAll({
      paginationFilters: {
        limit:      LIMIT,
        page:       page.value,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang },
      blogFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
      },
    });

    const paged = unwrap(raw as unknown);
    totalItems.value = paged?.totalItems ?? 0;
    const items = (paged?.objects ?? []) as BlogView[];
    if (reset) stories.value = items;
    else        stories.value.push(...items);
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value       = false;
    isLoadingMore.value = false;
  }
};

watch([sortOrder, searchQuery, locale], () => fetchPage(true));
onMounted(() => fetchPage(true));

// ── Infinite-scroll sentinel ──────────────────────────────────────────────
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

    <StoriesHeader />

    <StoryToolbar
      v-model:sort-order="sortOrder"
      :story-titles="[]"
      @update:search="searchQuery = $event"
    />

    <main class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">

      <StorySkeleton v-if="pending" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20">Error</p>
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

      <template v-else>
        <StoryTimeline
          :stories="stories"
          :sort-order="sortOrder"
        />

        <div ref="sentinel" class="h-1" aria-hidden="true" />

        <div v-if="isLoadingMore" class="flex items-center justify-center gap-3 py-10 text-muted-foreground">
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span class="font-brand font-black text-[10px] uppercase tracking-widest">
            {{ t("stories.loading") }}
          </span>
        </div>
      </template>

    </main>
    <ScrollToTop />
  </div>
</template>
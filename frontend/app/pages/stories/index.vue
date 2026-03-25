<!--
  pages/stories/index.vue
  =======================
  Overview
  --------
  This page implements the Stories (Blogs) archive overview.
  It renders all blog posts fetched from the backend API in a chronological
  timeline that is grouped first by year, then by month.

  Pagination strategy
  -------------------
  The backend returns a fixed window of LIMIT (20) items per request.
  An IntersectionObserver watches a 1 px sentinel element placed below the
  list. When it enters the viewport the observer increments `page` and calls
  `fetchPage(false)`, which appends the next slice to `stories`.  The guard
  `hasMore = stories.length < totalItems` prevents over-fetching.
  Resetting the sort order calls `fetchPage(true)`, which resets page to 0
  and replaces the current list.

  i18n
  ----
  All user-visible strings go through useI18n(). Keys live under `stories.*`
  in /i18n/en.json and /i18n/nl.json.

  Components used
  ---------------
  StoriesHeader  – sticky top bar with dark-mode toggle and language switcher
  StoryToolbar   – sort / filter controls
  StorySkeleton  – animated placeholder while the first page loads
  StoryTimeline  – year/month grouping + year-nav sidebar
-->

<script lang="ts" setup>
import type { Blog, BlogView, PaginatedResponse } from "@repo/common";
import StoriesHeader from "~/components/blogs/StoriesHeader.vue";
import StoryToolbar from "~/components/blogs/StoryToolbar.vue";
import StorySkeleton from "~/components/blogs/StorySkeleton.vue";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";

const { t } = useI18n();
const router = useRouter();
const { getAll } = useBlogApi();

const sortOrder = ref<"newest" | "oldest">("newest");
const showFilter = ref(false);

const LIMIT = 20;
const page = ref(0);
const totalItems = ref(0);
const stories = ref<Array<Blog | BlogView>>([]);
const pending = ref(false);
const isLoadingMore = ref(false);
const fetchError = ref<Error | null>(null);

const hasMore = computed(() => stories.value.length < totalItems.value);

const unwrap = (result: unknown): PaginatedResponse<Blog | BlogView> | null => {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object)) return r as any;
  return null;
};

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
    const raw = await getAll(
      
    );
    const paged = unwrap(raw);
    totalItems.value = paged?.totalItems ?? 0;
    const items = paged?.objects ?? [];
    if (reset) {
      stories.value = items;
    } else {
      stories.value.push(...items);
    }
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value = false;
    isLoadingMore.value = false;
  }
};

watch(sortOrder, () => fetchPage(true));
onMounted(() => fetchPage(true));

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

// Navigate to the correct route on click
const handleStoryClick = (story: Blog | BlogView) => {
  router.push(`/stories/${story.id}`);
};
</script>

<template>
  <div class="blog-page min-h-screen text-foreground">

    <StoriesHeader />
    <StoryToolbar
      v-model:sort-order="sortOrder"
      v-model:show-filter="showFilter"
      :total-items="totalItems"
      :loaded="stories.length"
    />

    <main class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">

      <StorySkeleton v-if="pending" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter text-muted-foreground/20">
          Error
        </p>
        <p class="font-brand font-black text-[10px] uppercase tracking-widest" style="color: #e57373;">
          {{ fetchError.message }}
        </p>
        <button
          class="mt-4 px-6 py-3 border border-border font-brand font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-all"
          @click="fetchPage(true)"
        >
          {{ t("stories.retry") }}
        </button>
      </div>

      <template v-else>
        <StoryTimeline
          :stories="stories"
          :sort-order="sortOrder"
          @story-click="handleStoryClick"
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
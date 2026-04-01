<script lang="ts" setup>
import type { BlogView, PaginatedResponse } from "@repo/common";
import StoriesHeader from "~/components/blogs/StoriesHeader.vue";
import StoryToolbar from "~/components/blogs/StoryToolbar.vue";
import StorySkeleton from "~/components/blogs/StorySkeleton.vue";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";

const { t, locale } = useI18n();
const { getAll } = useBlogApi();

const sortOrder      = ref<"newest" | "oldest">("newest");
const selectedYear   = ref<string | null>(null);
const availableYears = ref<string[]>([]);

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

/**
 * Two cheap requests (limit=1 each) to discover the full year range without
 * loading all stories. The nav is populated immediately on mount.
 */
const discoverYears = async () => {
  try {
    const lang = locale.value as "nl" | "en";
    const [rawDesc, rawAsc] = await Promise.all([
      getAll({ paginationFilters: { limit: 1, page: 0, descending: true  }, languageFilters: { lang } }),
      getAll({ paginationFilters: { limit: 1, page: 0, descending: false }, languageFilters: { lang } }),
    ]);
    const newest = unwrap(rawDesc as unknown)?.objects[0];
    const oldest = unwrap(rawAsc  as unknown)?.objects[0];
    const ny = newest?.created_at ? new Date(newest.created_at).getFullYear() : null;
    const oy = oldest?.created_at ? new Date(oldest.created_at).getFullYear() : null;
    if (ny && oy) {
      const yrs: string[] = [];
      for (let y = ny; y >= oy; y--) yrs.push(String(y));
      availableYears.value = yrs;
    }
  } catch {
    /* silent – nav will be empty but the page still works */
  }
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
    const y    = selectedYear.value !== null ? parseInt(selectedYear.value) : null;

    const raw = await getAll({
      paginationFilters: {
        limit:      LIMIT,
        page:       page.value,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang },
      ...(y !== null
        ? { blogFilters: { after: `${y}-01-01`, before: `${y + 1}-01-01` } }
        : {}),
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

/** Toggle: click selected year → clear filter; click other year → activate filter. */
const onYearSelect = (year: string) => {
  selectedYear.value = selectedYear.value === year ? null : year;
};

watch([sortOrder, selectedYear, locale], () => fetchPage(true));

onMounted(async () => {
  await discoverYears();
  fetchPage(true);
});

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

    <StoryToolbar v-model:sort-order="sortOrder" />

    <main class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">

      <StorySkeleton v-if="pending" />

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

      <template v-else>
        <StoryTimeline
          :stories="stories"
          :sort-order="sortOrder"
          :available-years="availableYears"
          :selected-year="selectedYear"
          @year-select="onYearSelect"
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
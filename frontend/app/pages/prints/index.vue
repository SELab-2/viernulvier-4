<script setup lang="ts">
import type { PrintItemView, PaginatedResponse } from "@repo/common";
import {usePrintApi} from "../../composables/usePrintsApi";
import ScrollToTop from "../../components/ScrollToTop.vue";

const { t, locale } = useI18n();
const { getAll }    = usePrintApi();

// Filters
const sortOrder   = ref<"newest" | "oldest">("newest");
const searchQuery = ref("");

// Pagination state
const LIMIT         = 20;
const page          = ref(0);
const totalItems    = ref(0);
const prints        = ref<PrintItemView[]>([]);
const pending       = ref(false);
const isLoadingMore = ref(false);
const fetchError    = ref<Error | null>(null);

const hasMore = computed(() => prints.value.length < totalItems.value);

function unwrap(result: unknown): PaginatedResponse<PrintItemView> | null {
  if (!result) return null;
  const r = result as any;
  if (r?.data && "objects" in r.data) return r.data;
  if ("objects" in (r as object))     return r as any;
  return null;
}

async function loadPage(reset = false) {
  if (!reset && (isLoadingMore.value || !hasMore.value)) return;

  if (reset) {
    page.value       = 0;
    prints.value     = [];
    pending.value    = true;
    fetchError.value = null;
  } else {
    isLoadingMore.value = true;
  }

  try {
    const raw = await getAll({
      paginationFilters: {
        page:       page.value,
        limit:      LIMIT,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      printFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
      },
    });

    const paged      = unwrap(raw);
    totalItems.value = paged?.totalItems ?? 0;
    const items      = (paged?.objects ?? []) as PrintItemView[];

    if (reset) prints.value = items;
    else        prints.value.push(...items);
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value       = false;
    isLoadingMore.value = false;
  }
}

watch([sortOrder, searchQuery, locale], () => loadPage(true));

// Infinite scroll
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

onMounted(() => loadPage(true));
onUnmounted(() => io?.disconnect());
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#151821] text-gray-900 dark:text-gray-100 transition-colors duration-200">

    <PrintsHeader />

    <PrintsToolbar
        v-model:sort-order="sortOrder"
        @update:search="searchQuery = $event"
    />

    <main class="container mx-auto px-4 max-w-5xl pt-4 pb-8 sm:pt-6 sm:pb-12">

      <PrintsSkeleton v-if="pending" />

      <div v-else-if="fetchError" class="py-24 text-center space-y-4">
        <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-20">
          {{ t("prints.noPrints") }}
        </p>
        <p class="font-brand font-black text-[10px] uppercase tracking-widest text-red-400">
          {{ fetchError.message }}
        </p>
        <button
            class="mt-4 px-6 py-3 border font-brand font-black text-[11px] uppercase tracking-widest transition-all border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
            @click="loadPage(true)"
        >
          {{ t("prints.retry") }}
        </button>
      </div>

      <template v-else>
        <PrintsDisplay :prints="prints" />

        <div ref="sentinel" class="h-1" aria-hidden="true" />

        <div
            v-if="isLoadingMore"
            class="flex items-center justify-center gap-3 py-10 text-muted-foreground"
        >
          <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span class="font-brand font-black text-[10px] uppercase tracking-widest">
            {{ t("prints.loading") }}
          </span>
        </div>
      </template>

    </main>
    <ScrollToTop/>
  </div>
</template>

<style scoped>
</style>
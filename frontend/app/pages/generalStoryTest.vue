<script lang="ts" setup>
import type { Blog, BlogView, PaginatedResponse } from "@repo/common";
import StoryTimeline from "~/components/blogs/StoryTimeline.vue";

const { t, locale, setLocale } = useI18n();
const { getAll } = useBlogApi();

// ── Dark mode (test page only) ────────────────────────────────────────────
const isDark = ref(
  typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark"),
);
const toggleDark = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

// ── Locale toggle (test page only) ────────────────────────────────────────
const toggleLocale = () => setLocale(locale.value === "nl" ? "en" : "nl");

// ── Toolbar state ─────────────────────────────────────────────────────────
const sortOrder  = ref<"newest" | "oldest">("newest");
const showFilter = ref(false);

// ── Infinite scroll state ─────────────────────────────────────────────────
const LIMIT         = 20;
const page          = ref(0);
const totalItems    = ref(0);
const apiStories    = ref<Array<Blog | BlogView>>([]);
const pending       = ref(false);
const isLoadingMore = ref(false);
const fetchError    = ref<Error | null>(null);

const hasMore = computed(() => apiStories.value.length < totalItems.value);
const mockStories = useState<Array<Blog>>("mock-stories", () => []);

const allStories = computed<Array<Blog | BlogView>>(() => [
  ...apiStories.value,
  ...mockStories.value,
]);

const unwrapPaginated = (
  result: unknown,
): PaginatedResponse<Blog | BlogView> | null => {
  if (!result) return null;
  const r = result as any;
  if (r.data && typeof r.data === "object" && "objects" in r.data) {
    return r.data as PaginatedResponse<Blog | BlogView>;
  }
  if ("objects" in r) {
    return r as PaginatedResponse<Blog | BlogView>;
  }
  return null;
};

const fetchPage = async (reset = false) => {
  if (reset) {
    page.value       = 0;
    apiStories.value = [];
    pending.value    = true;
    fetchError.value = null;
  } else {
    if (isLoadingMore.value || !hasMore.value) return;
    isLoadingMore.value = true;
  }

  try {
    const result     = await getAll(
      { limit: LIMIT, page: page.value },
      undefined,
      sortOrder.value === "newest",
    );
    const paged      = unwrapPaginated(result);
    const objects    = paged?.objects ?? [];
    totalItems.value = paged?.totalItems ?? 0;

    if (reset) {
      apiStories.value = objects;
    } else {
      apiStories.value.push(...objects);
    }
  } catch (e) {
    fetchError.value = e as Error;
  } finally {
    pending.value       = false;
    isLoadingMore.value = false;
  }
};

watch(sortOrder, () => fetchPage(true));
onMounted(() => fetchPage(true));

// ── Infinite scroll sentinel ──────────────────────────────────────────────
const sentinel = ref<HTMLElement | null>(null);
let scrollObserver: IntersectionObserver | null = null;

watch(sentinel, (el) => {
  scrollObserver?.disconnect();
  if (!el) return;
  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && hasMore.value && !isLoadingMore.value) {
        page.value++;
        fetchPage(false);
      }
    },
    { rootMargin: "400px" },
  );
  scrollObserver.observe(el);
});

onUnmounted(() => scrollObserver?.disconnect());

// ── Mock stories ──────────────────────────────────────────────────────────
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1503095396549-807759245b35?w=480&q=75",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=480&q=75",
];

const MOCK_TITLES = [
  { nl: "Achter de schermen bij De Grote Voorstelling", en: "Behind the Scenes of The Great Show" },
  { nl: "Interview met een pionier van de avant-garde", en: "Interview with an Avant-garde Pioneer" },
];

const MOCK_DESCS = [
  { nl: "Een blik achter de coulissen van onze producties.", en: "A look behind the curtain." },
  { nl: "We spraken over inspiratie en discipline.", en: "We spoke about inspiration and discipline." },
];

const randomDate = (): string => {
  const start = new Date("2016-01-01T00:00:00Z").getTime();
  return new Date(start + Math.random() * (Date.now() - start)).toISOString();
};

let mockIdCounter = -1;

const addMockStory = () => {
  const idx       = mockStories.value.length % MOCK_TITLES.length;
  const withImage = mockStories.value.length % 2 === 0;
  const date      = randomDate();
  mockStories.value.push({
    id:          mockIdCounter--,
    titel:       MOCK_TITLES[idx]  as { nl: string; en: string },
    description: MOCK_DESCS[idx]   as { nl: string; en: string },
    created_at:  date,
    updated_at:  date,
    ...(withImage ? { image: MOCK_IMAGES[idx % MOCK_IMAGES.length] } : {}),
  } as any);
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">

    <section class="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
      <div class="container mx-auto px-4 max-w-5xl py-3 flex items-center gap-2">

        <button
          class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 flex items-center gap-2"
          :class="showFilter ? 'border-foreground text-foreground bg-muted' : ''"
          @click="showFilter = !showFilter"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          filters
        </button>

        <div class="flex-1" />

        <button
          class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 flex items-center gap-2"
          @click="addMockStory"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add test story
          <span v-if="mockStories.length > 0" class="text-[8px] bg-foreground text-background px-1.5 py-0.5 rounded-full leading-none">{{ mockStories.length }}</span>
        </button>

        <button
          class="h-10 w-14 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          :title="`Switch to ${locale === 'nl' ? 'English' : 'Nederlands'}`"
          @click="toggleLocale"
        >
          {{ locale === "nl" ? "EN" : "NL" }}
        </button>

        <button
          class="h-10 w-10 flex items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          @click="toggleDark"
        >
          <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 pl-1">
          {{ allStories.length }}<span v-if="totalItems > 0" class="text-border"> / {{ totalItems }}</span>
          {{ t("stories.results") }}
        </span>
      </div>

      <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showFilter" class="container mx-auto px-4 max-w-5xl pb-3 border-t border-border pt-3 flex items-center gap-3">
          <select v-model="sortOrder" class="h-10 px-3 bg-muted border-none text-[11px] font-brand font-black uppercase tracking-wide text-muted-foreground focus:outline-none cursor-pointer">
            <option value="newest">{{ t("stories.sortNewest") }}</option>
            <option value="oldest">{{ t("stories.sortOldest") }}</option>
          </select>

          <button v-if="mockStories.length > 0" class="h-10 px-4 font-brand font-black text-[10px] uppercase tracking-widest border border-border text-muted-foreground hover:border-foreground hover:bg-muted transition-colors duration-150" @click="mockStories = []">
            Clear test stories
          </button>
        </div>
      </Transition>
    </section>

    <div class="container mx-auto px-4 max-w-5xl py-12">
      <div class="flex gap-6 lg:gap-12">
        <div class="flex-1 min-w-0">

          <div v-if="pending" class="space-y-12">
            <div v-for="i in 2" :key="i">
              <div class="flex items-center gap-4 mb-6">
                <div class="h-8 w-16 bg-muted animate-pulse" />
                <div class="h-5 w-20 bg-muted animate-pulse" />
                <div class="flex-1 h-px bg-muted" />
              </div>
              <div class="space-y-6">
                <div v-for="k in 2" :key="k">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="h-3 w-28 bg-muted animate-pulse" />
                    <div class="flex-1 h-px bg-muted" />
                  </div>
                  <div class="border border-border divide-y divide-border">
                    <div v-for="j in 2" :key="j" class="flex animate-pulse">
                      <div class="w-32 sm:w-40 bg-muted" style="aspect-ratio:4/3;min-height:88px;" />
                      <div class="flex-1 px-5 py-4 space-y-2">
                        <div class="h-3.5 bg-muted w-3/4" />
                        <div class="h-3 bg-muted w-1/2" />
                        <div class="h-3 bg-muted w-full mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="fetchError" class="py-24 text-center">
            <p class="font-brand font-black text-4xl uppercase italic tracking-tighter opacity-30 mb-3">Error</p>
            <p class="font-brand font-black text-[10px] uppercase tracking-widest text-red-500 mb-8">{{ fetchError.message }}</p>
            <button class="px-6 py-3 border border-border font-brand font-black text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted transition-all" @click="fetchPage(true)">
              {{ t("stories.retry") }}
            </button>
          </div>

          <template v-else>
            <StoryTimeline
              :stories="allStories"
              :sort-order="sortOrder"
              @story-click="(s) => navigateTo(`/blog/${s.id}`)"
            />

            <div ref="sentinel" class="h-1" aria-hidden="true" />

            <div v-if="isLoadingMore" class="flex items-center justify-center gap-3 py-10 text-muted-foreground">
              <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span class="font-brand font-black text-[10px] uppercase tracking-widest">{{ t("stories.loading") }}</span>
            </div>

            <div v-else-if="!hasMore && allStories.length > 0 && !pending" class="flex items-center gap-4 py-10">
              <div class="flex-1 h-px bg-border" />
              <span class="font-brand font-black text-[9px] uppercase tracking-widest text-muted-foreground shrink-0">
                {{ allStories.length }} {{ t("stories.results") }}
              </span>
              <div class="flex-1 h-px bg-border" />
            </div>
          </template>

        </div>
      </div>
    </div>
  </div>
</template>
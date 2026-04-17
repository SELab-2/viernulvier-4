<!--
  components/admin/blogs/ListView.vue
-->
<script setup lang="ts">
import type { BlogView, FilterBlog, PaginatedResponse } from "@repo/common";
import { Plus } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();

// ── Filters ──────────────────────────────────────────────────────────────────
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const dateFilter = ref<FilterBlog>({});
const selectedYear = ref<number | null>(null);
const calendarKey = ref(0);
const skipNextCalendarEmit = ref(false);

// Date bounds for YearPicker / Calendar
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
    const first = (oldestRaw.data as PaginatedResponse<BlogView>)?.objects?.[0];
    const last = (newestRaw.data as PaginatedResponse<BlogView>)?.objects?.[0];
    if (first?.created_at) oldestDate.value = first.created_at.slice(0, 10);
    if (last?.created_at) newestDate.value = last.created_at.slice(0, 10);
  } catch {
    /* non-critical */
  }
}

function onYearUpdate(year: number | null) {
  if (year === null) {
    selectedYear.value = null;
    calendarKey.value++;
    dateFilter.value = {};
  } else {
    selectedYear.value = year;
    skipNextCalendarEmit.value = true;
    dateFilter.value = { after: `${year}-01-01`, before: `${year}-12-31` };
    calendarKey.value++;
  }
}

function onCalendarFilter(filter: FilterBlog) {
  if (skipNextCalendarEmit.value) {
    skipNextCalendarEmit.value = false;
    return;
  }
  selectedYear.value = null;
  dateFilter.value = filter;
}

function clearAllFilters() {
  selectedYear.value = null;
  calendarKey.value++;
  dateFilter.value = {};
}

watch(
  () => dateFilter.value,
  (f) => {
    if (!f.after && !f.before) {
      selectedYear.value = null;
      return;
    }
    const isFullYear =
      f.after?.endsWith("-01-01") &&
      f.before?.endsWith("-12-31") &&
      f.after?.substring(0, 4) === f.before?.substring(0, 4);
    if (!isFullYear) selectedYear.value = null;
  },
  { deep: true },
);

const hasDateFilter = computed(
  () => !!(dateFilter.value.after || dateFilter.value.before),
);
const filterIsActive = computed(() => panelOpen.value || hasDateFilter.value);

// ── Filters panel ────────────────────────────────────────────────────────────
const panelOpen = ref(false);

// ── Pagination ───────────────────────────────────────────────────────────────
const currentPage = ref(0);
const PAGE_SIZE = 10;

// ── Data ─────────────────────────────────────────────────────────────────────
const blogs = ref<BlogView[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);
const deletingIds = ref(new Set<number>());

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / PAGE_SIZE)),
);
const showingStart = computed(() => currentPage.value * PAGE_SIZE + 1);
const showingEnd = computed(() =>
  Math.min((currentPage.value + 1) * PAGE_SIZE, totalItems.value),
);

// ── Load ─────────────────────────────────────────────────────────────────────
async function loadBlogs() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: currentPage.value,
        limit: PAGE_SIZE,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      blogFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(dateFilter.value.after ? { after: dateFilter.value.after } : {}),
        ...(dateFilter.value.before ? { before: dateFilter.value.before } : {}),
      },
    });

    const data = resp.data as PaginatedResponse<BlogView> | null;
    blogs.value = data?.objects ?? [];
    totalItems.value = data?.totalItems ?? 0;
  } catch {
    error.value = t("admin.blogs.fetchError");
  } finally {
    loading.value = false;
  }
}

// ── Debounced search ─────────────────────────────────────────────────────────
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 0;
    loadBlogs();
  }, 350);
});

watch([sortOrder, currentPage, locale, dateFilter], loadBlogs, { deep: true });

onMounted(async () => {
  await fetchDateBounds();
  loadBlogs();
});

// ── Delete ───────────────────────────────────────────────────────────────────
async function handleDelete(blog: BlogView) {
  const confirmMsg = t("admin.blogs.deleteConfirm", {
    title: blog.titel ?? blog.id,
  });
  if (!confirm(confirmMsg)) return;

  deletingIds.value.add(blog.id);
  try {
    await remove(blog.id);
    if (blogs.value.length === 1 && currentPage.value > 0) {
      currentPage.value--;
    } else {
      await loadBlogs();
    }
  } catch {
    alert(t("admin.blogs.saveError"));
  } finally {
    deletingIds.value.delete(blog.id);
  }
}

// ── Pagination ───────────────────────────────────────────────────────────────
function prevPage() {
  if (currentPage.value > 0) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
}

// ── Group by year+month for timeline ─────────────────────────────────────────
const byYear = computed(() => {
  const map = new Map<string, BlogView[]>();
  for (const s of blogs.value) {
    const year = String(new Date(s.created_at ?? 0).getFullYear());
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(s);
  }
  const keys = [...map.keys()].sort((a, b) =>
    sortOrder.value === "oldest" ? a.localeCompare(b) : b.localeCompare(a),
  );
  return keys.map((year) => ({ year, stories: map.get(year)! }));
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1
          class="font-brand font-black text-2xl uppercase tracking-tight text-foreground"
        >
          {{ t("nav.stories") }}
        </h1>
        <p
          v-if="!loading && totalItems > 0"
          class="text-sm text-muted-foreground mt-0.5"
        >
          {{ totalItems }} {{ t("admin.blogs.results") }}
        </p>
      </div>

      <NuxtLink :to="ROUTES.admin.stories.create">
        <button class="btn-outline flex items-center gap-2 shrink-0">
          <Plus :size="14" />
          {{ t("admin.blogs.new") }}
        </button>
      </NuxtLink>
    </div>

    <!-- Toolbar (mirrors StoryToolbar) -->
    <div class="border border-border rounded-xl overflow-hidden">
      <!-- Toolbar row -->
      <div class="flex items-stretch gap-3 p-4 bg-muted/40 flex-wrap">
        <!-- Search -->
        <div class="flex-1 min-w-48 h-10">
          <SearchBar
            v-model="searchQuery"
            :items="[]"
            :placeholder="t('stories.searchPlaceholder')"
          />
        </div>

        <!-- Filter toggle -->
        <div class="relative">
          <button
            :class="[
              'btn-outline h-10 gap-2 shrink-0',
              filterIsActive &&
                '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
            ]"
            :aria-expanded="panelOpen"
            @click="panelOpen = !panelOpen"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 2h10L7 6.5V10.5L5 9.5V6.5L1 2z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
            </svg>
            {{ t("stories.filters.toggle") }}
          </button>

          <!-- Clear badge -->
          <button
            v-if="hasDateFilter && !panelOpen"
            class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
            @click.stop="clearAllFilters"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 8 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l6 6M7 1L1 7"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- Sort -->
        <select
          v-model="sortOrder"
          class="h-10 px-3 rounded-md bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0"
        >
          <option value="newest">{{ t("stories.sortNewest") }}</option>
          <option value="oldest">{{ t("stories.sortOldest") }}</option>
        </select>
      </div>

      <!-- Filter panel -->
      <Transition name="cal-slide">
        <div v-if="panelOpen" class="border-t border-border">
          <div class="p-4 flex flex-col gap-6">
            <!-- Year picker -->
            <div class="flex flex-col gap-2">
              <span
                class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {{ t("stories.filters.year") }}
              </span>
              <YearPicker
                :model-value="selectedYear"
                :oldest-date="oldestDate"
                :newest-date="newestDate"
                @update:model-value="onYearUpdate"
              />
            </div>

            <!-- Calendar -->
            <div class="flex flex-col gap-2">
              <span
                class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {{ t("stories.filters.dateRange") }}
              </span>
              <DefaultCalendar
                :key="calendarKey"
                :oldest-date="oldestDate"
                :model-filter="dateFilter"
                @update:filter="onCalendarFilter"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Error banner -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in PAGE_SIZE"
        :key="i"
        class="h-20 bg-muted rounded-xl animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!blogs.length" class="py-20 text-center">
      <p
        class="font-brand font-black text-3xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
      >
        {{ t("stories.noStories") }}
      </p>
      <p
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        {{ t("stories.noStoriesDesc") }}
      </p>
    </div>

    <!-- Timeline -->
    <div v-else class="space-y-10">
      <section v-for="group in byYear" :key="group.year">
        <!-- Year heading -->
        <div class="blog-year-heading mb-4">
          <div class="blog-year-accent" aria-hidden="true" />
          <span class="blog-year-label font-brand select-none">{{
            group.year
          }}</span>
          <div class="flex-1 h-px bg-foreground/15 mx-3" />
        </div>

        <!-- Story rows -->
        <div class="space-y-3">
          <AdminBlogsListItem
            v-for="blog in group.stories"
            :key="blog.id"
            :blog="blog"
            :deleting="deletingIds.has(blog.id)"
            @delete="handleDelete(blog)"
          />
        </div>
      </section>
    </div>

    <!-- Pagination footer -->
    <div
      v-if="totalPages > 1 || totalItems > 0"
      class="flex items-center justify-between pt-2 border-t border-border"
    >
      <p
        v-if="totalItems > 0 && !loading"
        class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ showingStart }}–{{ showingEnd }} / {{ totalItems }}
      </p>
      <div v-else class="h-4 w-24 bg-muted rounded animate-pulse" />

      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <button
          :disabled="currentPage === 0"
          class="btn-outline px-3 h-9 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          @click="prevPage"
        >
          ←
        </button>
        <span
          class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground px-1"
        >
          {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage >= totalPages - 1"
          class="btn-outline px-3 h-9 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          @click="nextPage"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cal-slide-enter-active,
.cal-slide-leave-active {
  transition:
    opacity 0.18s ease,
    max-height 0.25s ease;
  overflow: hidden;
  max-height: 900px;
}
.cal-slide-enter-from,
.cal-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>

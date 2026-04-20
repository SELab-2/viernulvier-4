<!--
  components/admin/blogs/ListView.vue

  Admin overview of all blog stories.

  Features:
  - Timeline grouped by year (same as public stories page)
  - Full-text search with debounce
  - Sort order + year picker + calendar date filter in collapsible panel
  - Archive-style pagination (ArchivePagination + ArchivePageJumper)
  - Purple "New Story" CTA button (accent colour) placed prominently in the header
  - Per-item edit and delete actions
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

// ── Filter panel ─────────────────────────────────────────────────────────────
const panelOpen = ref(false);

// ── Pagination (mirrors ArchiveBody / ArchivePagination pattern) ─────────────
// Uses a 1-based currentPage ref exposed to ArchivePagination and
// ArchivePageJumper components (same as the archive page).
const PAGE_SIZE = 10;
const currentPage = ref(1); // 1-based for UI components
const totalPages = ref(1);

// ── Data ─────────────────────────────────────────────────────────────────────
const blogs = ref<BlogView[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);
const deletingIds = ref(new Set<number>());

const showingStart = computed(() => (currentPage.value - 1) * PAGE_SIZE + 1);
const showingEnd = computed(() =>
  Math.min(currentPage.value * PAGE_SIZE, totalItems.value),
);

// ── Load ─────────────────────────────────────────────────────────────────────
async function loadBlogs() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: currentPage.value - 1, // backend is 0-based
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
    totalPages.value = Math.max(
      1,
      Math.ceil((data?.totalItems ?? 0) / PAGE_SIZE),
    );
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
    currentPage.value = 1;
    loadBlogs();
  }, 350);
});

// Re-fetch when sort, page, locale, or date filter changes.
// currentPage is watched separately to allow ArchivePagination to drive it.
watch(
  [sortOrder, locale, dateFilter],
  () => {
    currentPage.value = 1;
    loadBlogs();
  },
  { deep: true },
);

watch(currentPage, loadBlogs);

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
    // Go back a page if we just deleted the last item on this page
    if (blogs.value.length === 1 && currentPage.value > 1) {
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

// ── Group by year for timeline display ────────────────────────────────────────
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
    <!-- ── Page header: title + prominent purple CTA ─────────────────────── -->
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

      <!--
        "New Story" button uses the accent (purple) fill to stand out clearly.
        Positioned at the right of the header so it is easy to spot.
      -->
      <NuxtLink :to="ROUTES.admin.stories.create">
        <button
          class="inline-flex items-center gap-2 shrink-0 px-5 py-2.5 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-accent-hover shadow-md shadow-accent/30"
        >
          <Plus :size="14" />
          {{ t("admin.blogs.new") }}
        </button>
      </NuxtLink>
    </div>

    <!-- ── Search + filter toolbar ───────────────────────────────────────── -->
    <div class="border border-border rounded-xl overflow-hidden bg-background">
      <div class="flex items-stretch gap-3 p-4 bg-muted/40 flex-wrap">
        <!-- Full-text search -->
        <div class="flex-1 min-w-0 h-10">
          <SearchBar
            v-model="searchQuery"
            :items="[]"
            :placeholder="t('stories.searchPlaceholder')"
          />
        </div>

        <!-- Filter toggle with active indicator -->
        <div class="relative">
          <button
            type="button"
            :class="[
              'btn-outline h-10 gap-2 shrink-0',
              filterIsActive &&
                '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
            ]"
            :aria-expanded="panelOpen"
            :aria-label="t('stories.filters.toggle')"
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
            <span>{{ t("stories.filters.toggle") }}</span>
          </button>

          <!-- ×-badge to clear date filter without opening panel -->
          <button
            v-if="hasDateFilter && !panelOpen"
            class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
            @click.stop="clearAllFilters"
            :aria-label="t('stories.filters.clear')"
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
      </div>

      <!-- Collapsible filter panel (sort + year + calendar) -->
      <Transition name="cal-slide">
        <div v-if="panelOpen" class="border-t border-border">
          <div class="p-4 flex flex-col gap-6">
            <!-- Sort order -->
            <div class="flex flex-col gap-2 w-max">
              <span class="section-label">{{ t("stories.sortLabel") }}</span>
              <select
                v-model="sortOrder"
                class="h-10 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 w-max"
              >
                <option value="newest">{{ t("stories.sortNewest") }}</option>
                <option value="oldest">{{ t("stories.sortOldest") }}</option>
              </select>
            </div>

            <!-- Year picker -->
            <div class="flex flex-col gap-2">
              <span class="section-label">{{ t("stories.filters.year") }}</span>
              <YearPicker
                :model-value="selectedYear"
                :oldest-date="oldestDate"
                :newest-date="newestDate"
                @update:model-value="onYearUpdate"
              />
            </div>

            <!-- Calendar date range picker -->
            <div class="flex flex-col gap-2">
              <span class="section-label">{{
                t("stories.filters.dateRange")
              }}</span>
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

    <!-- ── Error state ────────────────────────────────────────────────────── -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <!-- ── Loading skeleton ───────────────────────────────────────────────── -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in PAGE_SIZE"
        :key="i"
        class="h-20 bg-muted rounded-xl animate-pulse"
      />
    </div>

    <!-- ── Empty state ────────────────────────────────────────────────────── -->
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

    <!-- ── Timeline grouped by year ──────────────────────────────────────── -->
    <div v-else class="space-y-10">
      <section v-for="group in byYear" :key="group.year">
        <!-- Year heading (reuses the blog-year-* CSS from tailwind.css) -->
        <div class="blog-year-heading mb-4">
          <div class="blog-year-accent" aria-hidden="true" />
          <span class="blog-year-label font-brand select-none">{{
            group.year
          }}</span>
          <div class="flex-1 h-px bg-foreground/15 mx-3" />
        </div>

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

    <!-- ── Pagination (archive style) ────────────────────────────────────── -->
    <!--
      Mirrors the ArchiveBody pagination row exactly:
      showing-range on the left, ArchivePagination + ArchivePageJumper on the right.
      ArchivePagination and ArchivePageJumper read/write the shared `currentPage`
      and `totalPages` refs from useArchiveView. We bridge those refs here by
      providing a local wrapper that drives the same behaviour without polluting
      the archive composable state.
    -->
    <div
      v-if="totalPages > 1 || totalItems > 0"
      class="flex items-center justify-between pt-4 border-t border-border gap-4 flex-wrap"
    >
      <!-- Showing x–y of z -->
      <p
        v-if="totalItems > 0 && !loading"
        class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ showingStart }}–{{ showingEnd }} / {{ totalItems }}
      </p>
      <div v-else class="h-4 w-24 bg-muted rounded animate-pulse" />

      <!-- Navigation controls -->
      <div v-if="totalPages > 1" class="flex items-center gap-3">
        <!-- Page jumper -->
        <div class="flex items-center gap-2">
          <span
            class="text-sm font-black uppercase tracking-wide text-muted-foreground text-[10px]"
          >
            {{ t("archive.page_label") }}
          </span>
          <input
            type="number"
            :min="1"
            :max="totalPages"
            :placeholder="currentPage.toString()"
            :disabled="loading"
            @keydown.enter="
              (e) => {
                const v = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(v) && v >= 1 && v <= totalPages) currentPage = v;
                (e.target as HTMLInputElement).value = '';
              }
            "
            @blur="
              (e) => {
                const v = parseInt((e.target as HTMLInputElement).value, 10);
                if (!isNaN(v) && v >= 1 && v <= totalPages) currentPage = v;
                (e.target as HTMLInputElement).value = '';
              }
            "
            class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span
            class="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
          >
            {{ t("archive.of_pages", { total: totalPages }) }}
          </span>
        </div>

        <!-- Prev / next bar (same style as ArchivePagination) -->
        <nav
          class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
          :aria-label="t('archive.pagination')"
        >
          <!-- First -->
          <button
            class="w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            :disabled="currentPage === 1 || loading"
            @click="currentPage = 1"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.65"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
              />
            </svg>
          </button>
          <span class="w-[2px] bg-foreground" />

          <!-- Prev -->
          <button
            class="w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            :disabled="currentPage === 1 || loading"
            @click="currentPage--"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.65"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <span class="w-[2px] bg-foreground" />

          <!-- Current page indicator -->
          <span
            class="w-14 h-8 flex items-center justify-center bg-foreground text-background font-black text-sm"
          >
            {{ currentPage }}
          </span>
          <span class="w-[2px] bg-foreground" />

          <!-- Next -->
          <button
            class="w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            :disabled="currentPage === totalPages || loading"
            @click="currentPage++"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.65"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <span class="w-[2px] bg-foreground" />

          <!-- Last -->
          <button
            class="w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            :disabled="currentPage === totalPages || loading"
            @click="currentPage = totalPages"
          >
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.65"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Slide-down animation for the filter panel */
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

/* Small label above filter sections */
.section-label {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}
</style>

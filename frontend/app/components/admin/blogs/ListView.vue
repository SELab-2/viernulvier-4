<!--
  components/admin/blogs/ListView.vue
-->
<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogView } from "~/composables/blogs/useBlogView";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();
const { sortOrder, searchQuery, dateFilter, fetchSuggestions } = useBlogView();

const oldestDate = ref("");
const newestDate = ref("");

async function fetchDateBounds() {
  try {
    const [o, n] = await Promise.all([
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: false },
        languageFilters: { lang: locale.value as "nl" | "en" },
      }),
      getAll({
        paginationFilters: { page: 0, limit: 1, descending: true },
        languageFilters: { lang: locale.value as "nl" | "en" },
      }),
    ]);
    const first = (o.data as PaginatedResponse<BlogView>)?.objects?.[0];
    const last = (n.data as PaginatedResponse<BlogView>)?.objects?.[0];
    if (first?.created_at) oldestDate.value = first.created_at.slice(0, 10);
    if (last?.created_at) newestDate.value = last.created_at.slice(0, 10);
  } catch {
    /* non-critical */
  }
}

// Filters panel
const panelOpen = ref(false);
const selectedYear = ref<number | null>(null);
const calendarKey = ref(0);
const skipNextCalendarEmit = ref(false);

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

function onCalendarFilter(filter: { after?: string; before?: string }) {
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

const hasDateFilter = computed(
  () => !!(dateFilter.value.after || dateFilter.value.before),
);

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

// Pagination
const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const jumpInput = ref("");

function handleJump() {
  const v = parseInt(jumpInput.value, 10);
  if (!isNaN(v) && v >= 1 && v <= totalPages.value && v !== currentPage.value)
    currentPage.value = v;
  jumpInput.value = "";
}

// Blog data
const blogs = ref<BlogView[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const deletingIds = ref(new Set<number>());

async function loadBlogs() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: currentPage.value - 1,
        limit: PAGE_SIZE,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      blogFilters: {
        ...(searchQuery.value ? { title: searchQuery.value } : {}),
        ...(dateFilter.value.after ? { after: dateFilter.value.after } : {}),
        ...(dateFilter.value.before ? { before: dateFilter.value.before } : {}),
        is_suggestion: false,
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

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadBlogs();
  }, 350);
});

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

async function handleDelete(blog: BlogView) {
  if (
    !confirm(t("admin.blogs.deleteConfirm", { title: blog.titel ?? blog.id }))
  )
    return;
  deletingIds.value.add(blog.id);
  try {
    await remove(blog.id);
    if (blogs.value.length === 1 && currentPage.value > 1) currentPage.value--;
    else await loadBlogs();
  } catch {
    alert(t("admin.blogs.saveError"));
  } finally {
    deletingIds.value.delete(blog.id);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
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

    <!-- Toolbar: search + filters + add -->
    <div class="flex items-center gap-3">
      <!-- Search -->
      <div class="flex-1 min-w-0 h-11">
        <SearchBar
          v-model="searchQuery"
          :fetch-suggestions="fetchSuggestions"
          :limit="15"
          :scroll-limit="5"
          :placeholder="t('stories.searchPlaceholder')"
          class="h-full w-full"
        />
      </div>

      <!-- Filters button -->
      <div class="relative shrink-0">
        <button
          type="button"
          :class="[
            'btn-outline h-11 gap-2',
            panelOpen && '!bg-foreground !text-background !border-foreground',
          ]"
          @click="panelOpen = !panelOpen"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 2h10L7 6.5V10.5L5 9.5V6.5L1 2z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
          {{ t("general.filters") }}
        </button>

        <!-- Active filter badge -->
        <button
          v-if="hasDateFilter"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
          @click.stop="clearAllFilters"
          :aria-label="t('stories.filters.clear')"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path
              d="M1 1l6 6M7 1L1 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- Add button -->
      <NuxtLink
        :to="ROUTES.admin.stories.create"
        class="shrink-0 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg bg-accent text-white font-brand font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all hover:opacity-80 shadow-md shadow-accent/30"
      >
        <svg
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 5v14m-7-7h14"
          />
        </svg>
        {{ t("admin.blogs.new") }}
      </NuxtLink>
    </div>

    <!-- Filter panel -->
    <Transition name="cal-slide">
      <div
        v-if="panelOpen"
        class="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div class="p-6 flex flex-col gap-6">
          <!-- Sort -->
          <div class="flex flex-col gap-2 w-max">
            <span class="section-label">{{ t("stories.sortLabel") }}</span>
            <select
              v-model="sortOrder"
              class="h-10 px-3 rounded-lg bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer hover:border-foreground/30 transition-colors w-max"
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

          <!-- Calendar -->
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

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-feedback-error-border bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error-text"
    >
      {{ error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in PAGE_SIZE"
        :key="i"
        class="h-[136px] bg-muted rounded-xl animate-pulse"
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

    <!-- Story list -->
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="blog in blogs"
        :key="blog.id"
        :to="ROUTES.admin.stories.edit(blog.id)"
        class="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
      >
        <BlogsStoryListItem
          :story="blog"
          :is-admin="true"
          :deleting="deletingIds.has(blog.id)"
          @delete.stop="handleDelete(blog)"
        />
      </NuxtLink>
    </div>

    <!-- Pagination -->
    <AdminBlogsPagination
      v-if="totalPages > 1 || totalItems > 0"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :loading="loading"
      :jump-input="jumpInput"
      @update:current-page="currentPage = $event"
      @jump="handleJump"
      @update:jump-input="jumpInput = $event"
    />
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
.section-label {
  font-family: var(--font-brand, sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}
</style>

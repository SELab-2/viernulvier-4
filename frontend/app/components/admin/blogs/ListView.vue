<!--
  components/admin/blogs/ListView.vue

  Admin overview of all blog stories.

  Reuses the public-facing StoryToolbar (search + filters) and StoryTimeline
  (year/month grouped list) components to avoid code duplication.
  Adds admin-only actions (edit, delete) via a slot/wrapper around each item.

  Pagination: Page X of Y (identical to archive page).
  Create button: NuxtLink styled directly.
-->
<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { Plus } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import type { DateFilter } from "~/types/DateFilter";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();

// Filters

const sortOrder = ref<"newest" | "oldest">("newest");
const searchQuery = ref("");
const dateFilter = ref<DateFilter>({});

// Date bounds for calendar + year picker
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

// Data

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

// Delete

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
    <!--
      Reuse the public StoryToolbar for search + sort + date filters.
      This eliminates the large block of duplicated filter UI that was
      previously inlined here.
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

    <div class="page-container flex items-center justify-between mb-6">
      <div>
        <p
          v-if="!loading && totalItems > 0"
          class="font-brand text-2xl font-black text-foreground"
        >
          {{ totalItems }} {{ t("general.results") }}
        </p>
      </div>

      <NuxtLink
        :to="ROUTES.admin.stories.create"
        class="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent border-2 border-accent text-accent-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-accent transition"
      >
        <Plus :size="15" />
        {{ t("admin.blogs.new") }}
      </NuxtLink>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
    >
      {{ error }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div
        v-for="i in PAGE_SIZE"
        :key="i"
        class="h-20 bg-muted rounded-xl animate-pulse"
      />
    </div>

    <!-- Empty -->
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

    <!--
      Admin blog list: each story rendered as an AdminBlogsListItem
      (which adds edit/delete actions on top of the standard story card).
      We intentionally do NOT reuse StoryTimeline here because admin items
      need the edit/delete buttons that StoryTimeline's StoryListItem doesn't have.
    -->
    <div v-else class="page-container space-y-3">
      <AdminBlogsListItem
        v-for="blog in blogs"
        :key="blog.id"
        :blog="blog"
        :deleting="deletingIds.has(blog.id)"
        @delete="handleDelete(blog)"
      />
    </div>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1 || totalItems > 0"
      class="flex items-center justify-between pt-4 border-t border-border gap-4 flex-wrap"
    >
      <p
        v-if="totalItems > 0 && !loading"
        class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ totalItems }} {{ t("admin.blogs.results") }}
      </p>
      <div v-else class="h-4 w-24 bg-muted rounded animate-pulse" />

      <div v-if="totalPages > 1" class="flex items-center gap-3">
        <!-- Page jumper -->
        <div class="flex items-center gap-2">
          <span
            class="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
            >{{ t("archive.page_label") }}</span
          >
          <input
            v-model="jumpInput"
            type="number"
            :min="1"
            :max="totalPages"
            :placeholder="currentPage.toString()"
            :disabled="loading"
            @keydown.enter="handleJump"
            @blur="handleJump"
            class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span
            class="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
            >{{ t("archive.of_pages", { total: totalPages }) }}</span
          >
        </div>

        <!-- Nav buttons — same as archive pagination -->
        <nav
          class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
          :aria-label="t('archive.pagination')"
        >
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
          <span
            class="w-14 h-8 flex items-center justify-center bg-foreground text-background font-black text-sm"
          >
            {{ currentPage }}
          </span>
          <span class="w-[2px] bg-foreground" />
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

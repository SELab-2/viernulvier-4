<!--
  components/admin/blogs/ListView.vue
  ======================================
  Admin blog list — orchestrates fetching, filtering, pagination and deletion.

  Responsibility split:
  - This file owns all *state* and *business logic*:
      fetching blogs, handling deletes, managing pagination, filter state.
  - Presentation is delegated to sub-components:
      AdminBlogsToolbar    — search + filter toggle + "New story" button
      BlogsStoryListItem   — individual row card (shared with public page)
      AdminBlogsPagination — page-nav bar

  Sub-components are all auto-imported by Nuxt (no explicit imports needed).
-->

<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { Plus } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogView } from "~/composables/blogs/useBlogView";

// Composables

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();
const snackbar = useSnackbar();

/**
 * Pull shared filter refs from useBlogView.
 * sortOrder and searchQuery are module-level refs shared with the public
 * stories page; dateFilter is also module-level so filters persist across
 * navigation within the admin section.
 */
const { sortOrder, searchQuery, dateFilter, fetchSuggestions } = useBlogView();

// Date bounds (for year picker + calendar)

/** ISO date string of the oldest existing blog (fetched once on mount). */
const oldestDate = ref("");
/** ISO date string of the newest existing blog. */
const newestDate = ref("");

/**
 * Fetch the oldest and newest blog dates in parallel.
 * These are used to populate the YearPicker and DefaultCalendar lower/upper
 * bounds so the user can't select dates outside the available range.
 * Non-critical: the calendar still works if this fails.
 */
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
    /* Non-critical — calendar still works without bounds */
  }
}

// Pagination

const PAGE_SIZE = 10;
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

/** Value bound to the page-jump input. Reset to '' after each jump attempt. */
const jumpInput = ref("");

/** Jump to a specific page if the value is valid and different from current. */
function handleJump() {
  const v = parseInt(jumpInput.value, 10);
  if (!isNaN(v) && v >= 1 && v <= totalPages.value && v !== currentPage.value) {
    currentPage.value = v;
  }
  jumpInput.value = "";
}

// Blog data

const blogs = ref<BlogView[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

/**
 * IDs of blogs currently being deleted.
 * Passed to StoryListItem so it can show a spinner or disabled state while
 * the delete request is in flight.
 */
const deletingIds = ref(new Set<number>());

/**
 * Fetch the current page of blogs, applying all active filters.
 * Called on mount, on page changes, and whenever filters change.
 */
async function loadBlogs() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: currentPage.value - 1, // backend uses 0-based pages
        limit: PAGE_SIZE,
        descending: sortOrder.value === "newest",
      },
      languageFilters: { lang: locale.value as "nl" | "en" },
      blogFilters: {
        // Only pass filters that are actually set to avoid unnecessary query params.
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

// Watchers

/**
 * Debounce search input changes so we don't fire a request on every keystroke.
 * 350 ms matches the public stories page behaviour.
 */
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadBlogs();
  }, 350);
});

/** Reset to page 1 and reload whenever sort order, locale, or date filter changes. */
watch(
  [sortOrder, locale, dateFilter],
  () => {
    currentPage.value = 1;
    loadBlogs();
  },
  { deep: true },
);

/** Reload when the user navigates to a different page. */
watch(currentPage, loadBlogs);

// Lifecycle

onMounted(async () => {
  // Fetch date bounds first so the calendar/year-picker is ready before the
  // first blog page renders.
  await fetchDateBounds();
  loadBlogs();
});

// Delete

/**
 * Delete a blog after asking for confirmation.
 * If the deleted item was the only one on the current page, navigates to the
 * previous page rather than showing an empty list.
 */
async function handleDelete(blog: BlogView) {
  if (
    !confirm(t("admin.blogs.deleteConfirm", { title: blog.titel ?? blog.id }))
  )
    return;

  deletingIds.value.add(blog.id);
  try {
    const response = await remove(blog.id);

    if (response.error) {
      snackbar.add({
        type: "error",
        text: response.error ?? t("admin.blogs.deleteError"),
      });
      return;
    }

    if (blogs.value.length === 1 && currentPage.value > 1) {
      currentPage.value--; // triggers loadBlogs via watcher
    } else {
      await loadBlogs();
    }

    snackbar.add({
      type: "success",
      text: t("admin.blogs.deleteSuccess", { title: blog.titel ?? blog.id }),
    });
  } catch {
    snackbar.add({
      type: "error",
      text: t("admin.blogs.deleteError"),
    });
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

    <!-- Error banner -->
    <div
      v-if="error"
      class="rounded-lg border border-feedback-error-border bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error-text"
    >
      {{ error }}
    </div>

    <!-- Loading skeleton: one placeholder per PAGE_SIZE slot -->
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

    <!-- Story list: each item exposes edit/delete actions in the card -->
    <div v-else class="page-container space-y-3 pb-8">
      <!--
        BlogsStoryListItem is the same card used on the public stories page.
        `is-admin` switches it to show edit/delete buttons instead of a link.
        `deleting` disables the delete button while the API call is in flight.
      -->
      <BlogsStoryListItem
        v-for="blog in blogs"
        :key="blog.id"
        :story="blog"
        :is-admin="true"
        :deleting="deletingIds.has(blog.id)"
        @delete="handleDelete(blog)"
      />
      <!-- Pagination bar (hidden when there is only one page and no items yet) -->
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
  </div>
</template>

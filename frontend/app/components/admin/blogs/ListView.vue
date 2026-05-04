<!--
  components/admin/blogs/ListView.vue
  =====================================
  Admin overview for managing blog stories. Reuses StoryToolbar for
  search/filter/sort and StoryListItem (with isAdmin) for each row.

  Fix: toolbar now renders correctly with the add button aligned inline
  with the search bar inside the StoryToolbar's #action slot.
-->
<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useBlogView } from "~/composables/blogs/useBlogView";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();
const { sortOrder, searchQuery, dateFilter, fetchSuggestions } = useBlogView();

// Date bounds are needed by StoryToolbar's YearPicker and DefaultCalendar.
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
    /* Non-critical — toolbar still works without date bounds. */
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

// Debounce search input to avoid firing on every keystroke.
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

// Delete a blog after user confirmation.
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
  <div class="space-y-0">
    <!-- Page header -->
    <div class="flex items-center justify-between gap-4 mb-6">
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
    </div>

    <!--
      StoryToolbar: search + filters + add button all in one row.
      The #action slot renders flush inside the toolbar row, aligned with the
      search bar height (h-11 in dense mode).
    -->
    <StoryToolbar
      :dense="true"
      :story-titles="[]"
      :oldest-date="oldestDate"
      :newest-date="newestDate"
      :date-filter="dateFilter"
      @update:search="searchQuery = $event"
      @update:date-filter="dateFilter = $event"
    >
      <template #action>
        <NuxtLink
          :to="ROUTES.admin.stories.create"
          class="inline-flex items-center justify-center gap-2 shrink-0 px-4 h-11 rounded-lg bg-accent text-white font-brand font-black text-[10px] uppercase tracking-widest transition-all duration-150 hover:opacity-80 shadow-md shadow-accent/30 cursor-pointer whitespace-nowrap"
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
      </template>
    </StoryToolbar>

    <!-- Content -->
    <div class="pt-6 space-y-4">
      <!-- Error banner -->
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
  </div>
</template>

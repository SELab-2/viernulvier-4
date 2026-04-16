<!--
  components/admin/AdminBlogListView.vue
  ========================================
  Full admin overview of all blog/story entries.
  Includes:
  - Search bar (debounced title filter)
  - Sort order toggle (newest / oldest)
  - Date range filter (after / before)
  - Paginated list using AdminBlogListItem
  - Empty state and loading skeleton
  - Delete with confirmation
-->
<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { Plus } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { getAll, remove } = useBlogApi();
const { locale } = useI18n();

// --- State ---
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const currentPage = ref(0);
const PAGE_SIZE = 10;

const blogs = ref<BlogView[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / PAGE_SIZE)),
);

const showingStart = computed(() => currentPage.value * PAGE_SIZE + 1);
const showingEnd = computed(() =>
  Math.min((currentPage.value + 1) * PAGE_SIZE, totalItems.value),
);

// --- Load ---
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
      blogFilters: searchQuery.value ? { title: searchQuery.value } : {},
    });

    const data = resp.data as PaginatedResponse<BlogView> | null;
    blogs.value = data?.objects ?? [];
    totalItems.value = data?.totalItems ?? 0;
  } catch {
    error.value = "Failed to load stories.";
  } finally {
    loading.value = false;
  }
}

// --- Search debounce ---
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 0;
    loadBlogs();
  }, 350);
});

// --- Watchers ---
watch([sortOrder, currentPage], loadBlogs);
onMounted(loadBlogs);

// --- Navigation ---
function handleEdit(blog: BlogView) {
  navigateTo(ROUTES.admin.stories.edit(blog.id));
}

// --- Delete ---
async function handleDelete(blog: BlogView) {
  if (!confirm(`Delete "${blog.titel}"? This cannot be undone.`)) return;
  try {
    await remove(blog.id);
    // Stay on current page, or back one if it becomes empty
    if (blogs.value.length === 1 && currentPage.value > 0) {
      currentPage.value--;
    } else {
      await loadBlogs();
    }
  } catch {
    alert("Failed to delete story. Please try again.");
  }
}

// --- Pagination ---
function prevPage() {
  if (currentPage.value > 0) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++;
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1
          class="font-brand font-black text-2xl uppercase tracking-tight text-foreground"
        >
          Stories
        </h1>
        <p v-if="!loading" class="text-sm text-muted-foreground mt-0.5">
          {{ totalItems }} {{ totalItems === 1 ? "story" : "stories" }}
        </p>
      </div>

      <NuxtLink :to="ROUTES.admin.stories.create">
        <button class="btn-outline flex items-center gap-2 shrink-0">
          <Plus :size="14" />
          New story
        </button>
      </NuxtLink>
    </div>

    <!-- Filters row -->
    <div class="flex gap-3 items-stretch flex-wrap">
      <!-- Search -->
      <div class="flex-1 min-w-48 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="[]"
          placeholder="Search stories..."
        />
      </div>

      <!-- Sort -->
      <select
        v-model="sortOrder"
        class="h-10 px-3 rounded-md bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
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
        class="h-24 bg-muted rounded-lg animate-pulse"
      />
    </div>

    <!-- Empty state -->
    <div v-else-if="!blogs.length" class="py-20 text-center">
      <p
        class="font-brand font-black text-3xl uppercase italic tracking-tighter text-muted-foreground/30 mb-2"
      >
        No stories
      </p>
      <p
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
      >
        {{
          searchQuery
            ? "Try a different search term."
            : "Create your first story to get started."
        }}
      </p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <AdminBlogListItem
        v-for="blog in blogs"
        :key="blog.id"
        :blog="blog"
        @edit="handleEdit"
        @delete="handleDelete"
      />
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
        {{ showingStart }}–{{ showingEnd }} of {{ totalItems }}
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

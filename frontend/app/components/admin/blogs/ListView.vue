<!--
  components/admin/blogs/ListView.vue

  Full paginated admin list of blog/story entries.
  - Debounced search (title filter)
  - Sort order (newest / oldest)
  - Per-row delete spinner so the UI stays responsive during deletion
  - All UI strings come from i18n (admin.blogs.*)
-->
<script setup lang="ts">
import type { BlogView, PaginatedResponse } from "@repo/common";
import { Plus } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { getAll, remove } = useBlogApi();
const { locale, t } = useI18n();

// ── Filters & pagination ─────────────────────────────────────────────────────
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const currentPage = ref(0);
const PAGE_SIZE = 10;

// ── Data ─────────────────────────────────────────────────────────────────────
const blogs = ref<BlogView[]>([]);
const totalItems = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);

// Track which blog IDs are currently being deleted so we can show a spinner
const deletingIds = ref(new Set<number>());

// ── Derived ──────────────────────────────────────────────────────────────────
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
      // Always use locale so titles are already flat strings in the list
      languageFilters: { lang: locale.value as "nl" | "en" },
      blogFilters: searchQuery.value ? { title: searchQuery.value } : {},
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

watch([sortOrder, currentPage, locale], loadBlogs);
onMounted(loadBlogs);

// ── Delete ───────────────────────────────────────────────────────────────────
async function handleDelete(blog: BlogView) {
  const confirmMsg = t("admin.blogs.deleteConfirm", {
    title: blog.titel ?? blog.id,
  });
  if (!confirm(confirmMsg)) return;

  deletingIds.value.add(blog.id);
  try {
    await remove(blog.id);
    // If the page is now empty, go back one page
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

    <!-- Filters row -->
    <div class="flex gap-3 items-stretch flex-wrap">
      <div class="flex-1 min-w-48 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="[]"
          :placeholder="t('stories.searchPlaceholder')"
        />
      </div>

      <select
        v-model="sortOrder"
        class="h-10 px-3 rounded-md bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0"
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
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
        {{
          searchQuery ? t("stories.noStoriesDesc") : t("admin.blogs.new") + "?"
        }}
      </p>
    </div>

    <!-- List — note :blog="blog" (not :story) to match ListItem's prop name -->
    <div v-else class="space-y-3">
      <AdminBlogsListItem
        v-for="blog in blogs"
        :key="blog.id"
        :blog="blog"
        :deleting="deletingIds.has(blog.id)"
        @delete="handleDelete(blog)"
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

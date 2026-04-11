<!--
TagFilter.vue

Tag selection component for the archive filters.
Responsible for:
- Fetching and displaying available tags from the API
- Allowing users to select/deselect tags
- Supporting "show more / show less" behavior for large tag sets
- Clearing all selected tags

Uses:
- useArchiveView: shared archive filter state (tagIds)
- useTagApi: API access for fetching tags
-->
<script setup lang="ts">
import { useTagApi } from "~/composables/useTagApi";
import { useArchiveView } from "~/composables/useArchiveView";
import type { TagView, PaginatedResponse } from "@repo/common";

const { tagIds } = useArchiveView();
const { getAll } = useTagApi();
const { t, locale } = useI18n();

const tags = ref<TagView[]>([]);
const showAll = ref(false); // controls whether all tags are shown
const MAX_VISIBLE = 24; // first N tags to show initially

const hasSelection = computed(() => tagIds.value.length > 0);

function clearAll() {
  tagIds.value = [];
}

function toggle(id: number) {
  const idx = tagIds.value.indexOf(id);

  if (idx === -1) {
    tagIds.value.push(id);
  } else {
    tagIds.value.splice(idx, 1);
  }
}

const isSelected = (id: number) => tagIds.value.includes(id);

async function fetchTags() {
  try {
    const allTags: TagView[] = [];
    let page = 0;
    const limit = 100;
    let totalPages = 1;

    // Fetch all pages of tags (API is paginated)
    do {
      const resp = await getAll({
        paginationFilters: { page, limit, descending: false },
        languageFilters: { lang: locale.value as "nl" | "en" },
      });

      if (!resp.data) break;

      const data = resp.data as PaginatedResponse<TagView>;

      // Filter out invalid placeholder tags
      const validTags = data.objects.filter((tag) => tag.tag !== "N/A");

      allTags.push(...validTags);

      totalPages = Math.ceil(data.totalItems / limit);
      page += 1;
    } while (page < totalPages);

    tags.value = allTags;
  } catch (err) {
    console.error("Failed to fetch tags", err);
  }
}

onMounted(fetchTags);

// Refetch tags when language changes
watch(locale, fetchTags);
</script>

<template>
  <div class="flex flex-wrap gap-2 items-center">
    <!-- Tag buttons -->
    <button
      v-for="tag in showAll ? tags : tags.slice(0, MAX_VISIBLE)"
      :key="tag.id"
      :class="[
        'h-8 px-3 rounded-full border text-[9px] font-brand font-black uppercase tracking-widest transition-colors',
        isSelected(tag.id)
          ? 'bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]'
          : 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]',
      ]"
      @click="toggle(tag.id)"
    >
      {{ tag.tag }}
    </button>

    <!-- Show more / less toggle -->
    <button
      v-if="tags.length > MAX_VISIBLE"
      @click="showAll = !showAll"
      :class="[
        'h-8 px-3 rounded-full text-[9px] font-brand font-black uppercase tracking-widest transition-colors flex items-center justify-center',
        'bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-mid)] hover:text-white border-[var(--blog-purple-ghost)]',
      ]"
    >
      {{
        showAll
          ? t("archive.show_less")
          : t("archive.show_more", { count: tags.length - MAX_VISIBLE })
      }}
    </button>

    <!-- Clear selection -->
    <button
      v-if="hasSelection"
      @click="clearAll"
      class="h-8 px-3 rounded-full text-[9px] font-brand font-black uppercase tracking-widest transition-colors flex items-center justify-center border border-foreground bg-background text-foreground hover:bg-foreground hover:text-background"
    >
      {{ t("archive.clear_tags") }} ({{ tagIds.length }})
    </button>
  </div>
</template>

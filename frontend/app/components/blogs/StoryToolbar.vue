<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Toolbar: search bar (filters by story title) + sort order toggle.

  Props:
  - storyTitles  : string[]           — all visible story titles, fed into SearchBar
  - sortOrder    : "newest" | "oldest"

  Emits:
  - update:sortOrder  (v-model)
  - update:search     — emits the current search query string (empty = no filter)
-->
<script lang="ts" setup>
const props = defineProps<{
  storyTitles: string[];
}>();

const emit = defineEmits<{
  (e: "update:search", query: string): void;
}>();

const sortOrder = defineModel<"newest" | "oldest">("sortOrder", { required: true });
const searchQuery = ref("");

const { t } = useI18n();

// Forward search changes to parent
watch(searchQuery, (val) => emit("update:search", val));
</script>

<template>
  <div class="relative border-b border-border bg-background">
    <div class="container mx-auto px-4 max-w-5xl py-2 flex items-center gap-3">

      <!-- Search bar — grows to fill available space -->
      <div class="flex-1 min-w-0">
        <SearchBar
          v-model="searchQuery"
          :items="storyTitles"
          :limit="6"
          :scroll-limit="4"
          :placeholder="t('stories.searchPlaceholder')"
          class="!m-0"
        />
      </div>

      <!-- Sort order -->
      <select
        v-model="sortOrder"
        class="h-9 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0"
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
      </select>

    </div>
  </div>
</template>
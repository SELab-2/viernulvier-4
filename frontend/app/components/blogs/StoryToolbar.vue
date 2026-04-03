<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Toolbar: search bar (filters by story title) + sort order toggle.
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

watch(searchQuery, (val) => emit("update:search", val));
</script>

<template>
  <div class="relative border-b border-border bg-background">
    <div class="container mx-auto px-4 max-w-5xl py-5 flex items-stretch gap-3">

      <!--
        Wrapper div with explicit height so the SearchBar is constrained
        to the same visual height as the select.
      -->
      <div class="flex-1 min-w-0 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="storyTitles"
          :limit="6"
          :scroll-limit="4"
          :placeholder="t('stories.searchPlaceholder')"
          class="!m-0 !h-full [&>input]:!h-full [&>div]:!h-full"
        />
      </div>

      <!-- Select — h-10 matches the wrapper above -->
      <select
        v-model="sortOrder"
        class="
          h-10 px-3 rounded
          bg-muted border border-border
          text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground
          focus:outline-none cursor-pointer
          transition-colors hover:border-foreground/30
          shrink-0 self-center
        "
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
      </select>

    </div>
  </div>
</template>
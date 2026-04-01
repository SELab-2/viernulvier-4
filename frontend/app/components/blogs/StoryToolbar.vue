<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Minimal toolbar: only the sort order.
 
-->
<script lang="ts" setup>
const sortOrder = defineModel<"newest" | "oldest">("sortOrder", { required: true });
const { t } = useI18n();
</script>

<template>
  <div class="relative border-b border-border bg-background">
    <div class="container mx-auto px-4 max-w-5xl py-2.5 flex items-center justify-end">
      <select
        v-model="sortOrder"
        class="h-9 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30"
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
      </select>
    </div>
  </div>
</template>
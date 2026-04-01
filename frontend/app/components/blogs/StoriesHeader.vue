<!--
  components/blogs/StoriesHeader.vue
  ------------------------------------
  Minimal sticky top bar for the stories section.
-->

<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <header
    class="
      stories-header sticky top-0 z-20
      bg-white/95 dark:bg-[#151821]/95
      backdrop-blur-sm border-b border-gray-200 dark:border-[#2e3347]
      transition-colors duration-200
    "
  >
    <div class="container mx-auto px-4 max-w-5xl flex items-center h-14">
      <h1
        class="
          text-lg font-brand font-black uppercase tracking-tight
          text-gray-900 dark:text-gray-100
        "
      >
        {{ t("stories.title") }}
      </h1>
    </div>
  </header>
</template>
<!--
  components/blogs/StoriesHeader.vue
  ------------------------------------
  Hero header for the stories section. Shows the section title and a short
  description. A slim sticky bar appears on top once the user scrolls.
-->
<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <div class="bg-white dark:bg-[#151821] border-b border-gray-200 dark:border-[#2e3347] transition-colors duration-200">
    <div class="container mx-auto px-4 max-w-5xl py-8 sm:py-12">
      <h1
        class="font-brand font-black text-4xl sm:text-6xl uppercase tracking-tighter leading-none text-gray-900 dark:text-gray-100 mb-3"
      >
        {{ t("stories.title") }}
      </h1>
      <p
        class="font-brand font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 truncate"
      >
        {{ t("stories.headerDescription") }}
      </p>
    </div>
  </div>
</template>
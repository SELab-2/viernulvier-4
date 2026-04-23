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
  <header
    class="w-full border-b border-border bg-muted transition-colors duration-200"
  >
    <div class="page-container py-8 sm:py-12">
      <h1 class="page-header-title">
        {{ t("stories.title") }}
      </h1>
      <p class="page-header-subtitle">
        {{ t("stories.headerDescription") }}
      </p>
    </div>
  </header>
</template>

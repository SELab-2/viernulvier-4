<!--
  components/prints/PrintsHeader.vue
  ------------------------------------
  Hero header for the prints section. Shows the section title and a short
  description. A slim sticky bar appears on top once the user scrolls.
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <header
    class="w-full border-b border-border bg-muted transition-colors duration-200"
  >
    <div class="page-container py-8 sm:py-12">
      <h1 class="page-header-title">
        {{ t("prints.title") }}
      </h1>
      <p class="page-header-subtitle">
        {{ t("prints.headerDescription") }}
      </p>
    </div>
  </header>
</template>

<style scoped></style>

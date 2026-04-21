<!--
ArchiveHeader.vue

Displays the header section of the archive page.
Responsible for:
- Rendering the archive title and subtitle
- Handling translations via i18n
-->
<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <header
    class="w-full border-b border-border bg-muted transition-colors duration-200"
  >
    <div class="page-container py-12">
      <h1 class="page-header-title">
        {{ t("archive.header_title") }}
      </h1>
      <p class="page-header-subtitle">
        {{ t("archive.header_subtitle") }}
      </p>
    </div>
  </header>
</template>

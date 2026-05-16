<!--
archive/index.vue

Main archive page container.
Responsible for:
- Composing the archive page layout
- Combining header, search/filter section, and results body
- Acting as a structural wrapper (no logic)
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <PageHeader
      :title="t('archive.header_title')"
      :description="t('archive.header_subtitle')"
    />
    <ArchiveSearchSection />
    <ArchiveBody />
  </div>
</template>

<!--
  Admin page for productions management.
  It reuses the same components as the normal archive page, but with the is-admin prop set to true.
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <PageHeader
      :title="t('admin-productions.header_title')"
      :description="t('admin-productions.description')"
    />
    <ArchiveSearchSection is-admin />
    <ArchiveBody is-admin />
  </div>
</template>

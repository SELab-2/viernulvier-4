<!--
  Admin page for series management.
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-background">
    <PageHeader :title="t('admin.dashboard.series')" />
    <AdminSeriesListView />
  </div>
</template>

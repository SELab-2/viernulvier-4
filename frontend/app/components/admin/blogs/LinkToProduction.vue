<!--
  components/admin/blogs/LinkToProduction.vue
  =============================================
  Wrapper around the generic ProductionLinker for blogs.
-->

<script setup lang="ts">
defineProps<{
  blogId?: number | null;
  galleryId?: number | null; // not used, kept for symmetry
}>();
</script>

<template>
  <AdminSharedProductionLinker :entity-id="blogId" type="blog" />
</template>

<!--
  pages/admin/stories/index.vue
-->
<script setup lang="ts">
import { useAdminGuard } from "~/composables/useAdminGuard";

useAdminGuard();
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-6 py-10">
      <AdminBlogsListView />
    </div>
  </div>
</template>

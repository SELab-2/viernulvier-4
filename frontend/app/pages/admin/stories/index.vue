<!--
  pages/admin/stories/index.vue

  Admin Blog List Page

  This page serves as the entry point for managing blog posts (stories)
  within the admin panel.

  It renders the blog list view component, which is responsible for:
  - Displaying all existing blog posts
  - Handling actions such as creating, editing, and deleting entries

  The page itself acts as a simple layout wrapper that:
  - Provides consistent spacing and centered content
  - Applies the admin UI background and container styling

  Designed to keep page-level concerns minimal while delegating all
  business logic and interactions to the AdminBlogsListView component.
-->
<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <PageHeader :title="t('nav.stories')" />
    <AdminBlogsListView />
  </div>
</template>

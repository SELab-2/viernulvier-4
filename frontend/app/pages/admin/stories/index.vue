<!--
  pages/admin/stories/index.vue
  ================================
  Admin landing page for the stories/blogs section.
  Renders the full list view with search, filters, and CRUD navigation.
  Redirects unauthenticated visitors to the login page.
-->
<script setup lang="ts">
const { isLoggedIn } = useAuth();

// Guard: redirect to login if not authenticated
onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo(ROUTES.admin.login.base);
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-6 py-10">
      <AdminBlogListView />
    </div>
  </div>
</template>

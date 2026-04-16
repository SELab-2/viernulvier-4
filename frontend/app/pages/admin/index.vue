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
  <section class="min-h-screen bg-gray-50 py-16 px-6">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      <p class="text-lg text-gray-600 leading-relaxed mb-8">
        Welcome to the admin dashboard! Here you can manage everything.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          :to="ROUTES.admin.stories.base"
          class="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
        >
          <h2
            class="text-xl font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors"
          >
            Stories & Blogs
          </h2>
          <p class="text-gray-600">
            Create, edit and manage archive stories and blog posts.
          </p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

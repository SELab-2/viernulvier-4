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

      <p class="text-lg text-gray-600 leading-relaxed">
        Welcome to the admin dashboard! Here you can manage everything.
      </p>
    </div>
  </section>
</template>

<style scoped></style>

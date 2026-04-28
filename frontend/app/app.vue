<script setup lang="ts">
const { rehydrate } = useAuth();

onMounted(() => {
  rehydrate();
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
      <NuxtSnackbar />
    </NuxtLayout>
  </div>
</template>

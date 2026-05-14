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
    </NuxtLayout>
    <NuxtSnackbar />
  </div>
</template>

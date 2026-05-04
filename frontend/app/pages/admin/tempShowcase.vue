<script setup lang="ts">
const { isLoggedIn } = useAuth();

onMounted(() => {
  if (!isLoggedIn.value) {
    navigateTo(ROUTES.admin.login.base);
  }
});
</script>

<template>
  <section
    class="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:px-10"
  >
    <div class="mb-8 space-y-3">
      <p
        class="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground"
      >
        Temporary showcase
      </p>
      <h1 class="text-3xl font-semibold text-card-foreground sm:text-4xl">
        CSV templates
      </h1>
      <p class="max-w-2xl text-sm text-muted-foreground">
        A simple sandbox page for the CSV template downloads component.
      </p>
    </div>

    <div class="flex-1 space-y-6">
      <AdminCsvTemplateDownload target="productions" />
      <AdminCsvTemplateDownload target="events" />
      <AdminCsvTemplateDownload target="tags" />
      <AdminCsvTemplateDownload target="blogs" />
      <AdminCsvTemplateDownload target="prices" />
    </div>
  </section>
</template>

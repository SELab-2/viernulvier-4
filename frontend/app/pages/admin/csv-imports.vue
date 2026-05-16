<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ROUTES } from "~/utils/routes";

definePageMeta({ ssr: false });
const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="page-container py-10 space-y-6">
      <NuxtLink
        :to="ROUTES.admin.productions.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t("admin.back") }}
      </NuxtLink>

      <h1
        class="font-brand font-black text-2xl uppercase tracking-tight text-foreground truncate"
      >
        {{ t("admin.csvImport.label") }}
      </h1>

      <div class="space-y-8">
        <AdminCsvImportCard target="productions" />
        <AdminCsvImportCard target="tags" />
        <AdminCsvImportCard target="events" />
        <AdminCsvImportCard target="prices" />
      </div>
    </div>
  </div>
</template>

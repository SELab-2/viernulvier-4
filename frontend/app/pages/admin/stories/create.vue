<!--
  pages/admin/stories/create.vue

  Creates a new blog entry then redirects to the edit page.
  Shows a live preview alongside the form (same two-column layout as edit).
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

// TipTap uses browser-only APIs — disable SSR for this page
definePageMeta({ ssr: false });

const { create } = useBlogApi();
const { t } = useI18n();

const saving = ref(false);
const error = ref<string | null>(null);

// Live preview data fed by the form's @preview-update event
const previewData = ref<{
  titel: { nl: string; en: string };
  description: { nl: string; en: string };
}>({
  titel: { nl: "", en: "" },
  description: { nl: "", en: "" },
});

async function handleSubmit(data: CreateBlog) {
  saving.value = true;
  error.value = null;
  try {
    const resp = await create(data);
    if (resp.data) {
      await navigateTo(ROUTES.admin.stories.edit(resp.data.id));
    } else {
      error.value = resp.error ?? t("admin.blogs.createError");
    }
  } catch {
    error.value = t("admin.blogs.createError");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <!-- Back link -->
      <NuxtLink
        :to="ROUTES.admin.stories.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t("admin.back") }}
      </NuxtLink>

      <h1
        class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
      >
        {{ t("admin.blogs.new") }}
      </h1>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- Two-column layout: form left, live preview right -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <!-- Left column: form -->
        <AdminBlogsForm
          mode="create"
          :loading="saving"
          @submit="handleSubmit"
          @cancel="navigateTo(ROUTES.admin.stories.base)"
          @preview-update="(d) => (previewData = d)"
        />

        <!-- Right column: live preview (desktop only) -->
        <div class="hidden xl:block">
          <div class="sticky top-6">
            <AdminBlogsPreview :data="previewData" :header-crop-url="null" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

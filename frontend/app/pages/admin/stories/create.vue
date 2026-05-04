<!--
  pages/admin/stories/create.vue

  Admin Blog Create Page

  This page handles the creation of a new blog post within the admin panel.
  It provides a form for entering blog content along with a live preview
  displayed alongside the form.

  Key features include:
  - Client-side rendering only (SSR disabled) due to TipTap editor dependencies
  - Two-column layout with the form on the left and a live preview on the right
  - Real-time preview updates based on form input
  - Error handling with user feedback on failed submissions

  On submission:
  - A new blog entry is created via the API
  - The user is redirected to the edit page of the newly created blog
    (where additional steps like image upload can be completed)

  The page coordinates:
  - Form state and submission handling
  - Preview synchronization via emitted events
  - Navigation and error display

  Designed to provide a smooth, guided flow for creating new blog content.
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
          @submit="(data) => handleSubmit(data as CreateBlog)"
          @cancel="navigateTo(ROUTES.admin.stories.base)"
          @preview-update="(d) => (previewData = d)"
        />

        <!-- Right column: live preview (desktop only) -->
        <div class="hidden xl:block">
          <div class="sticky top-6">
            <AdminBlogsPreview :data="previewData" :header-crop="null" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

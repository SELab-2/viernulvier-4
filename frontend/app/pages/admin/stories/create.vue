<!--
  pages/admin/stories/create.vue

  Creates a new blog entry, then immediately redirects to the edit page.
  This means create and edit share 100% of their UI — zero duplication.
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useAdminGuard } from "~/composables/useAdminGuard";

useAdminGuard();

const { create } = useBlogApi();
const { t } = useI18n();

const saving = ref(false);
const error = ref<string | null>(null);
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 py-10 space-y-6">
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

      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <AdminBlogsForm
        mode="create"
        :loading="saving"
        @submit="
          async (data: CreateBlog) => {
            saving = true;
            error = null;
            try {
              const resp = await create(data);
              if (resp.data) {
                await navigateTo(ROUTES.admin.stories.edit(resp.data.id));
              } else {
                error = resp.error ?? t('admin.blogs.createError');
              }
            } catch {
              error = t('admin.blogs.createError');
            } finally {
              saving = false;
            }
          }
        "
        @cancel="navigateTo(ROUTES.admin.stories.base)"
      />
    </div>
  </div>
</template>

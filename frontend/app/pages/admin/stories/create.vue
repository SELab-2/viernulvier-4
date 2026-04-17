<!--
  pages/admin/stories/create.vue
  =================================
  Two-step create flow on a single page:

  Step 1 — Fill in the bilingual form and click "Create story".
           The blog is saved via POST /blogs and we receive the new ID.

  Step 2 — The form is replaced by AdminBlogsImageSection so the user
           can immediately upload a header image without navigating away.
           "← Edit content" goes to the edit page; "Finish" goes to the list.
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
const createdBlogId = ref<number | null>(null);

async function handleSubmit(data: CreateBlog) {
  saving.value = true;
  error.value = null;
  try {
    const resp = await create(data);
    if (resp.data) {
      createdBlogId.value = resp.data.id;
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
    <div class="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <!-- Breadcrumb -->
      <NuxtLink
        :to="ROUTES.admin.stories.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t("admin.back") }}
      </NuxtLink>

      <!-- Page title -->
      <h1
        class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
      >
        <template v-if="!createdBlogId">{{ t("admin.blogs.new") }}</template>
        <template v-else>{{ t("admin.blogs.image.multiTitle") }}</template>
      </h1>

      <!-- Step indicator -->
      <div class="flex items-center gap-3">
        <div
          class="flex items-center gap-2 font-brand font-black text-[10px] uppercase tracking-widest"
          :class="
            !createdBlogId
              ? 'text-foreground'
              : 'text-muted-foreground line-through'
          "
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0"
            :class="
              !createdBlogId
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'
            "
            >1</span
          >
          {{ t("admin.blogs.sectionContent") }}
        </div>
        <div class="flex-1 h-px bg-border" />
        <div
          class="flex items-center gap-2 font-brand font-black text-[10px] uppercase tracking-widest"
          :class="createdBlogId ? 'text-foreground' : 'text-muted-foreground'"
        >
          <span
            class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] shrink-0"
            :class="
              createdBlogId
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground'
            "
            >2</span
          >
          {{ t("admin.blogs.image.title") }}
        </div>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- ── Step 1: form ──────────────────────────────────────────── -->
      <AdminBlogsForm
        v-if="!createdBlogId"
        mode="create"
        :loading="saving"
        @submit="handleSubmit"
        @cancel="navigateTo(ROUTES.admin.stories.base)"
      />

      <!-- ── Step 2: image upload ──────────────────────────────────── -->
      <template v-else>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ t("admin.blogs.image.createSuccessHint") }}
        </p>

        <AdminBlogsImageSection :blog-id="createdBlogId" />

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          <!-- Back to content — goes to edit page so they can update the text -->
          <NuxtLink
            :to="ROUTES.admin.stories.edit(createdBlogId)"
            class="btn-outline px-6 shrink-0 flex items-center gap-2"
          >
            ← {{ t("admin.blogs.image.backToForm") }}
          </NuxtLink>

          <!-- Finish — back to stories list -->
          <button
            class="btn-outline flex-1 justify-center"
            @click="navigateTo(ROUTES.admin.stories.base)"
          >
            {{ t("admin.save") }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

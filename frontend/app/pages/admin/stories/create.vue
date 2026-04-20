<!--
  pages/admin/stories/create.vue

  Two-step story creation flow:

  Step 1 — Fill in the bilingual form and click "Next".
           The blog is created via POST /blogs; we receive the new ID.

  Step 2 — Upload header image crops via AdminBlogsImageSection.
           "← Edit content" links back to the edit page.
           "Finish" returns to the story list.

  A live "Site Preview" panel (AdminBlogsPreview) sits alongside the form in
  Step 1 so editors can see roughly how the story will appear on the public
  site before saving.
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

// Live preview data — kept in sync with the form via v-model on the child form.
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
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-6">
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

      <!-- Step indicator: "Content" → "Images" -->
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

      <!-- ── Step 1: form + live preview side by side ─────────────────── -->
      <div
        v-if="!createdBlogId"
        class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start"
      >
        <!--
          Left column: the bilingual form.
          The form emits "preview-update" so we can keep the right column in
          sync without waiting for the user to submit.
        -->
        <AdminBlogsForm
          mode="create"
          :loading="saving"
          @submit="handleSubmit"
          @cancel="navigateTo(ROUTES.admin.stories.base)"
          @preview-update="(d) => (previewData = d)"
        />

        <!--
          Right column: live site preview.
          Shows roughly how the story will look on the public stories page.
        -->
        <div class="hidden xl:block sticky top-24">
          <AdminBlogsPreview :data="previewData" />
        </div>
      </div>

      <!-- ── Step 2: image upload ──────────────────────────────────────── -->
      <template v-else>
        <p class="text-sm text-muted-foreground leading-relaxed">
          {{ t("admin.blogs.image.createSuccessHint") }}
        </p>

        <AdminBlogsImageSection :blog-id="createdBlogId" />

        <!-- Actions -->
        <div class="flex items-center gap-3 pt-2">
          <NuxtLink
            :to="ROUTES.admin.stories.edit(createdBlogId)"
            class="btn-outline px-6 shrink-0 flex items-center gap-2"
          >
            ← {{ t("admin.blogs.image.backToForm") }}
          </NuxtLink>

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

<!--
  pages/admin/stories/create.vue
  =================================
  Two-step create flow on a single page:

  Step 1 — Fill in the bilingual form and click "Create story".
           The blog is saved via POST /blogs and we receive the new ID.

  Step 2 — The form is replaced by the AdminBlogImageSection so the user
           can immediately upload a header image without navigating away.
           Two buttons: "Upload another" (stays) and "Finish" (→ stories list).
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useAdminGuard } from "~/composables/useAdminGuard";

useAdminGuard();

const { create } = useBlogApi();

// --- State ---
const saving = ref(false);
const error = ref<string | null>(null);
const createdBlogId = ref<number | null>(null); // null = still on step 1

// --- Step 1: create blog ---
async function handleSubmit(data: CreateBlog) {
  saving.value = true;
  error.value = null;

  try {
    const resp = await create(data);
    if (resp.data) {
      createdBlogId.value = resp.data.id;
    } else {
      error.value = resp.error ?? "Failed to create story.";
    }
  } catch {
    error.value = "An unexpected error occurred.";
  } finally {
    saving.value = false;
  }
}

// --- Step 2: finish ---
function finish() {
  navigateTo(ROUTES.admin.stories.base);
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
        ← Back to stories
      </NuxtLink>

      <!-- Page title -->
      <h1
        class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
      >
        <template v-if="!createdBlogId">New story</template>
        <template v-else>Add header image</template>
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
          Content
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
          Image
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
          Your story has been created. You can upload a header image now, or
          skip and do it later from the edit page.
        </p>

        <AdminBlogsImageSection :blog-id="createdBlogId" />

        <!-- Finish / skip actions -->
        <div class="flex items-center gap-3 pt-2">
          <button class="btn-outline flex-1 justify-center" @click="finish">
            Finish
          </button>
          <NuxtLink
            :to="ROUTES.admin.stories.edit(createdBlogId)"
            class="btn-outline px-8 shrink-0"
          >
            Edit more
          </NuxtLink>
        </div>
      </template>
    </div>
  </div>
</template>

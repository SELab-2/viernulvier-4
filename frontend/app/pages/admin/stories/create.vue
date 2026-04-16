<!--
  pages/admin/stories/create.vue
  =================================
  Admin page for creating a new blog/story.

  After a successful POST the user is redirected to the edit page so they
  can immediately upload a header image for the new story.
-->
<script setup lang="ts">
import type { CreateBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

const { create } = useBlogApi();
const { isLoggedIn } = useAuth();

const saving = ref(false);
const error = ref<string | null>(null);

// Guard
onMounted(() => {
  if (!isLoggedIn.value) navigateTo(ROUTES.admin.login.base);
});

async function handleSubmit(data: CreateBlog) {
  saving.value = true;
  error.value = null;

  try {
    const resp = await create(data);
    if (resp.data) {
      // Redirect to edit so the user can upload an image right away
      navigateTo(ROUTES.admin.stories.edit(resp.data.id));
    } else {
      error.value = resp.error ?? "Failed to create story.";
    }
  } catch {
    error.value = "An unexpected error occurred.";
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
        ← Back to stories
      </NuxtLink>

      <!-- Page title -->
      <h1
        class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
      >
        New story
      </h1>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <AdminBlogForm
        mode="create"
        :loading="saving"
        @submit="handleSubmit"
        @cancel="navigateTo(ROUTES.admin.stories.base)"
      />
    </div>
  </div>
</template>

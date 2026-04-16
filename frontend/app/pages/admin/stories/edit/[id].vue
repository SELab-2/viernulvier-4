<!--
  pages/admin/stories/edit/[id].vue
-->
<script setup lang="ts">
import type { Blog, ModifyBlog } from "@repo/common";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useAdminGuard } from "~/composables/useAdminGuard";

useAdminGuard();

const route = useRoute();
const { getById, modify } = useBlogApi();

const blogId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const blog = ref<Blog | null>(null);
const fetching = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

async function loadBlog() {
  if (!blogId.value) return;
  fetching.value = true;
  error.value = null;
  try {
    const resp = await getById(blogId.value); // no lang → full localized object
    blog.value = resp.data as Blog;
  } catch {
    error.value = "Failed to load story. Please try again.";
  } finally {
    fetching.value = false;
  }
}

async function handleSubmit(data: ModifyBlog) {
  if (!blogId.value) return;
  saving.value = true;
  error.value = null;
  try {
    await modify(blogId.value, data);
    navigateTo(ROUTES.admin.stories.base);
  } catch {
    error.value = "Failed to save changes. Please try again.";
  } finally {
    saving.value = false;
  }
}

onMounted(loadBlog);
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <NuxtLink
        :to="ROUTES.admin.stories.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to stories
      </NuxtLink>

      <h1
        class="font-brand font-black text-3xl uppercase tracking-tight text-foreground"
      >
        Edit story
      </h1>

      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <template v-if="fetching">
        <div class="h-64 bg-muted rounded-xl animate-pulse" />
        <div class="h-48 bg-muted rounded-xl animate-pulse" />
        <div class="h-80 bg-muted rounded-xl animate-pulse" />
      </template>

      <div v-else-if="!blog" class="py-16 text-center text-muted-foreground">
        Story not found.
      </div>

      <template v-else-if="blog && blogId">
        <AdminBlogsAdminBlogImageSection :blog-id="blogId" />

        <AdminBlogForm
          mode="edit"
          :initial-data="{
            titel: blog.titel as { nl: string; en: string },
            description: blog.description as { nl: string; en: string },
          }"
          :loading="saving"
          @submit="handleSubmit"
          @cancel="navigateTo(ROUTES.admin.stories.base)"
        />
      </template>
    </div>
  </div>
</template>

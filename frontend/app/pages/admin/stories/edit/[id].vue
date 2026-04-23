<!--
  pages/admin/stories/edit/[id].vue

  Admin Blog Edit Page

  This page provides the full editing experience for an existing blog post.
  It is also the destination after creating a new blog, ensuring that both
  create and edit flows share the exact same UI and behavior.

  Key features include:
  - Client-side rendering only (SSR disabled) due to TipTap editor usage
  - Fetching and loading blog data based on the route ID
  - Live preview synchronized with form input
  - Two-column layout with editor on the left and preview on the right (desktop)
  - Collapsible preview on mobile for better usability

  The page manages:
  - Blog content editing (title and description)
  - Media gallery loading and main image preview
  - Image upload and cropping via a dedicated section
  - Linking the blog to related productions
  - Save state, including loading, error handling, and success feedback

  Additional behavior:
  - Displays loading skeletons while fetching data
  - Handles invalid or missing blog IDs gracefully
  - Updates preview content immediately when the form changes
  - Refreshes the gallery when new images are uploaded

  Designed as the central hub for managing all aspects of a blog post
  within the admin panel.
-->
<script setup lang="ts">
import type { Blog, ModifyBlog } from "@repo/common";
import type {
  GalleryWithItems,
  ItemViewWithCrops,
} from "~/utils/galleryFetcher";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";

// TipTap uses browser-only APIs — disable SSR for this page
definePageMeta({ ssr: false });

const route = useRoute();
const { getById, modify, getMediaGallery } = useBlogApi();
const { getMainImageCrop } = useGallery();
const { t, locale } = useI18n();

// Resolved blog ID from the route
const blogId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// State
const blog = ref<Blog | null>(null);
const fetching = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const saved = ref(false);

// Live preview data — updated by form's @preview-update event
const previewData = ref<{
  titel: { nl: string; en: string };
  description: { nl: string; en: string };
}>({
  titel: { nl: "", en: "" },
  description: { nl: "", en: "" },
});

// Preview toggle on mobile
const previewOpen = ref(false);

// Gallery (for the preview hero image)
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const galleryId = ref<number | null>(null);

const headerCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "FE3_header");
});

async function loadGallery() {
  if (!blogId.value) return;
  try {
    gallery.value = await getMediaGallery(blogId.value, locale.value);
    galleryId.value = gallery.value?.id ?? null;
  } catch {
    gallery.value = null;
    galleryId.value = null;
  }
}

// Blog data
async function loadBlog() {
  if (!blogId.value) return;
  fetching.value = true;
  error.value = null;
  try {
    const resp = await getById(blogId.value);
    blog.value = resp.data as Blog;
    if (blog.value) {
      const tl = blog.value.titel as { nl: string; en: string };
      const dc = blog.value.description as { nl: string; en: string };
      previewData.value = {
        titel: { nl: tl.nl ?? "", en: tl.en ?? "" },
        description: { nl: dc.nl ?? "", en: dc.en ?? "" },
      };
    }
  } catch {
    error.value = t("admin.blogs.loadError");
  } finally {
    fetching.value = false;
  }
}

// Save
async function handleSubmit(data: ModifyBlog) {
  if (!blogId.value) return;
  saving.value = true;
  saved.value = false;
  error.value = null;
  try {
    await modify(blogId.value, data);
    saved.value = true;
    setTimeout(() => (saved.value = false), 3000);
  } catch {
    error.value = t("admin.blogs.saveError");
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await loadBlog();
  await loadGallery();
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <!-- Back link -->
      <NuxtLink
        :to="ROUTES.admin.stories.base"
        class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        ← {{ t("admin.back") }}
      </NuxtLink>

      <!-- Title row -->
      <div class="flex items-center gap-3 flex-wrap">
        <h1
          class="font-brand font-black text-3xl uppercase tracking-tight text-foreground flex-1"
        >
          {{ t("admin.blogs.edit") }}
        </h1>

        <!-- Saved feedback badge -->
        <Transition name="fade">
          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest"
          >
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ t("admin.saved") }}
          </span>
        </Transition>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>

      <!-- Loading skeleton -->
      <template v-if="fetching">
        <div class="h-64 bg-muted rounded-xl animate-pulse" />
        <div class="h-48 bg-muted rounded-xl animate-pulse" />
        <div class="h-80 bg-muted rounded-xl animate-pulse" />
      </template>

      <!-- Not found -->
      <div
        v-else-if="!blog && !fetching"
        class="py-16 text-center text-muted-foreground"
      >
        {{ t("admin.blogs.notFound") }}
      </div>

      <template v-else-if="blog && blogId">
        <!-- Mobile preview toggle -->
        <div class="xl:hidden">
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors"
            @click="previewOpen = !previewOpen"
          >
            <span
              class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2"
            >
              <svg
                class="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" stroke-linecap="round" />
              </svg>
              {{ t("admin.blogs.preview.label") }}
            </span>
            <svg
              class="w-4 h-4 text-muted-foreground transition-transform duration-200"
              :class="previewOpen ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0 overflow-hidden"
            enter-to-class="opacity-100 max-h-[600px] overflow-hidden"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 max-h-[600px] overflow-hidden"
            leave-to-class="opacity-0 max-h-0 overflow-hidden"
          >
            <div v-if="previewOpen" class="mt-3">
              <AdminBlogsPreview
                :data="{ ...previewData, id: blogId ?? undefined }"
                :header-crop="headerCrop"
              />
            </div>
          </Transition>
        </div>

        <!-- Two-column grid -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <!-- Left column: all editable sections -->
          <div class="space-y-6">
            <!-- Content form -->
            <AdminBlogsForm
              mode="edit"
              :initial-data="{
                titel: blog.titel as { nl: string; en: string },
                description: blog.description as { nl: string; en: string },
              }"
              :loading="saving"
              @submit="handleSubmit"
              @cancel="navigateTo(ROUTES.admin.stories.base)"
              @preview-update="(d) => (previewData = d)"
            />

            <!-- Image section (only when blogId is resolved) -->
            <AdminBlogsImageSection
              v-if="blogId !== null"
              :blog-id="blogId"
              @crop-uploaded="loadGallery"
            />

            <!-- Link to productions (only when blogId is resolved) -->
            <AdminBlogsLinkToProduction
              v-if="blogId !== null"
              :blog-id="blogId"
              :gallery-id="galleryId"
            />
          </div>

          <!-- Right column: live preview (desktop only) -->
          <div class="hidden xl:block">
            <div class="sticky top-6">
              <AdminBlogsPreview
                :data="{ ...previewData, id: blogId ?? undefined }"
                :header-crop="headerCrop"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

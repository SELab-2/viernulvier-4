<!--
  pages/admin/stories/edit/[id].vue
  ====================================
  Admin blog edit page — two-step layout.

  Steps:
  1. "Title & Content"  — bilingual title + rich-text description + link-to-production.
                          Live preview panel (sticky on desktop, collapsible on mobile).
  2. "Header images"    — crop upload grid + item metadata card.

  Navigation between steps is handled by tab buttons at the top of the page.
  The step can be pre-selected via `?step=photos` in the URL (used by the
  create page after saving, so the user lands on step 2 immediately).

  Component breakdown:
  ┌─ edit/[id].vue (this file) ─────────────────────────────────────────────┐
  │  Data: loads blog, gallery, headerCrop. Handles save + restore.         │
  │                                                                         │
  │  Step 1 tab                                                             │
  │  ├── AdminBlogsForm         — title + description fields + submit       │
  │  ├── AdminBlogsLinkToProduction — link/unlink production cards          │
  │  └── AdminBlogsPreview      — live preview panel                        │
  │                                                                         │
  │  Step 2 tab                                                             │
  │  └── AdminBlogsImageSection — crop grid + item metadata                 │
  │      ├── AdminBlogsCropGrid                                             │
  │      └── AdminBlogsItemMetadata                                         │
  └─────────────────────────────────────────────────────────────────────────┘
-->

<script setup lang="ts">
import type { Blog, ModifyBlog } from "@repo/common";
import type {
  GalleryWithItems,
  ItemViewWithCrops,
} from "~/utils/galleryFetcher";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";

definePageMeta({ ssr: false });

// Composables

const route = useRoute();
const { getById, modify, getMediaGallery } = useBlogApi();
const { getMainImageCrop } = useGallery();
const { t, locale } = useI18n();

// Route param

/** Parse the blog ID from the dynamic route segment. */
const blogId = computed<number | null>(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// Page state

const blog = ref<Blog | null>(null);
const fetching = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
/** True for 3 s after a successful save — drives the "Saved ✓" badge. */
const saved = ref(false);

/** Active step tab ('content' | 'photos'). */
const step = ref<"content" | "photos">("content");

/**
 * Live data fed into the preview panel.
 * Updated on every keystroke via the 'preview-update' event from AdminBlogsForm.
 */
const previewData = ref<{
  titel: { nl: string; en: string };
  description: { nl: string; en: string };
}>({ titel: { nl: "", en: "" }, description: { nl: "", en: "" } });

// Gallery state

/** Full gallery with items — used to extract the header crop for the preview. */
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
/** Gallery ID passed to LinkToProduction so it can link via the correct gallery. */
const galleryId = ref<number | null>(null);

/** The FE3_header crop shown in the preview hero. */
const headerCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "FE3_header") : null,
);

// Derived initial data for AdminBlogsForm

/**
 * Unwrap the localised titel + description from the fetched Blog object.
 * AdminBlogsForm uses this as its `initial-data` prop to pre-populate fields.
 */
const initialBlogData = computed(() => {
  if (!blog.value) return undefined;
  return {
    titel: blog.value.titel as { nl: string; en: string },
    description: blog.value.description as { nl: string; en: string },
  };
});

// Data fetching

/** Load the gallery and extract the header crop + gallery ID. */
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

/** Fetch the raw Blog object (not localised, so we get both NL and EN). */
async function loadBlog() {
  if (!blogId.value) return;
  fetching.value = true;
  error.value = null;
  try {
    const resp = await getById(blogId.value);
    blog.value = resp.data as Blog;

    // Seed the preview panel with the freshly fetched data.
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

// Lifecycle

onMounted(async () => {
  // Allow the create page to redirect to step 2 via ?step=photos.
  if (route.query.step === "photos") step.value = "photos";

  // Load data in parallel for speed.
  await Promise.all([loadBlog(), loadGallery()]);
});

// Save / restore

/** Submit the form — PATCH the blog and show a transient "Saved" badge. */
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

/**
 * Restore the form to the last saved state by re-fetching the blog.
 * Requires confirmation because unsaved changes will be lost.
 */
async function restoreToSaved() {
  if (
    !confirm(
      t("admin.blogs.restoreConfirm") || "Restore to last saved version?",
    )
  )
    return;
  await loadBlog();
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <!-- Top bar: back link + title + "Saved" badge -->
      <div class="flex items-center gap-4 flex-wrap">
        <NuxtLink
          :to="ROUTES.admin.stories.base"
          class="inline-flex items-center gap-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {{ t("admin.back") }}
        </NuxtLink>
        <h1
          class="font-brand font-black text-2xl uppercase tracking-tight text-foreground flex-1 truncate"
        >
          {{ t("admin.blogs.edit") }}
        </h1>

        <!-- Transient "Saved ✓" badge — fades in for 3 s after a successful save -->
        <Transition name="fade">
          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-feedback-success-bg text-feedback-success-text border border-feedback-success-border text-[10px] font-black uppercase tracking-widest shrink-0"
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

      <!-- Step indicator tabs -->
      <div
        class="flex items-center gap-0 border border-border rounded-xl overflow-hidden w-fit"
      >
        <!-- Step 1: Title & Content -->
        <button
          type="button"
          :class="[
            'flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-brand font-black uppercase tracking-widest transition-colors',
            step === 'content'
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ]"
          @click="step = 'content'"
        >
          <span
            :class="[
              'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 shrink-0',
              step === 'content'
                ? 'border-background'
                : 'border-muted-foreground',
            ]"
            >1</span
          >
          {{ t("admin.blogs.sectionTitle") }} &amp;
          {{ t("admin.blogs.sectionContent") }}
        </button>

        <span class="w-px bg-border self-stretch" />

        <!-- Step 2: Header Images -->
        <button
          type="button"
          :class="[
            'flex items-center gap-2.5 px-5 py-2.5 text-[11px] font-brand font-black uppercase tracking-widest transition-colors',
            step === 'photos'
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:text-foreground',
          ]"
          @click="step = 'photos'"
        >
          <span
            :class="[
              'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border-2 shrink-0',
              step === 'photos'
                ? 'border-background'
                : 'border-muted-foreground',
            ]"
            >2</span
          >
          {{ t("admin.blogs.image.multiTitle") }}
        </button>
      </div>

      <!-- Error banner -->
      <div
        v-if="error"
        class="rounded-lg border border-feedback-error-border bg-feedback-error-bg px-4 py-3 text-sm text-feedback-error-text"
      >
        {{ error }}
      </div>

      <!-- Loading skeleton -->
      <template v-if="fetching">
        <div
          class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start"
        >
          <div class="space-y-4">
            <div class="h-52 bg-muted rounded-xl animate-pulse" />
            <div class="h-80 bg-muted rounded-xl animate-pulse" />
          </div>
          <div class="hidden xl:block h-96 bg-muted rounded-xl animate-pulse" />
        </div>
      </template>

      <!-- Not found -->
      <div
        v-else-if="!blog && !fetching"
        class="py-16 text-center text-muted-foreground"
      >
        {{ t("admin.blogs.notFound") }}
      </div>

      <!-- Main content -->
      <template v-else-if="blog && blogId">
        <!--
          Two-column grid on XL screens.
          Left  = active step (form or image section).
          Right = sticky live preview (desktop only).
          items-start prevents the preview column from stretching to match
          the left column's height.
        -->
        <div
          class="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 items-start"
        >
          <!-- Left column: active step -->
          <div class="space-y-5 min-w-0">
            <!-- Step 1: Title + Description + Link to production -->
            <template v-if="step === 'content'">
              <AdminBlogsForm
                mode="edit"
                :initial-data="initialBlogData"
                :loading="saving"
                @submit="handleSubmit"
                @preview-update="(d) => (previewData = d)"
              >
                <!-- Link-to-production card is rendered above the Save button via the #extra slot -->
                <template #extra>
                  <AdminBlogsLinkToProduction
                    :blog-id="blogId"
                    :gallery-id="galleryId"
                  />
                </template>
              </AdminBlogsForm>

              <!-- Step 1 footer nav: Back | Restore | → Photos -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="ROUTES.admin.stories.base"
                    class="btn-outline h-10 flex items-center gap-1.5 px-5 text-[10px]"
                  >
                    <svg
                      class="w-3 h-3 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                    {{ t("admin.back") }}
                  </NuxtLink>
                  <button
                    type="button"
                    class="btn-outline h-10 px-5 text-[10px]"
                    @click="restoreToSaved"
                  >
                    {{ t("admin.blogs.restoreBtn") }}
                  </button>
                </div>

                <button
                  type="button"
                  class="btn-outline h-10 flex items-center gap-1.5 px-5 text-[10px]"
                  @click="step = 'photos'"
                >
                  {{ t("admin.blogs.image.multiTitle") }}
                  <svg
                    class="w-3 h-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </template>

            <!-- Step 2: Crop grid + item metadata -->
            <template v-if="step === 'photos'">
              <!--
                ImageSection now delegates crop rendering to CropGrid and
                metadata to ItemMetadata — it only owns the API orchestration.
              -->
              <AdminBlogsImageSection
                :blog-id="blogId"
                @crop-uploaded="loadGallery"
              />

              <!-- Step 2 footer nav: Back to list | ← Content -->
              <div class="flex items-center justify-between gap-3">
                <NuxtLink
                  :to="ROUTES.admin.stories.base"
                  class="btn-outline h-10 flex items-center gap-1.5 px-5 text-[10px]"
                >
                  <svg
                    class="w-3 h-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  {{ t("admin.back") }}
                </NuxtLink>

                <button
                  type="button"
                  class="btn-outline h-10 flex items-center gap-1.5 px-5 text-[10px]"
                  @click="step = 'content'"
                >
                  <svg
                    class="w-3 h-3 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                  {{ t("admin.blogs.sectionTitle") }} &amp;
                  {{ t("admin.blogs.sectionContent") }}
                </button>
              </div>
            </template>
          </div>

          <!-- Right column: sticky live preview (desktop only) -->
          <div class="hidden xl:block self-start sticky top-28">
            <AdminBlogsPreview
              :data="{ ...previewData, id: blogId ?? undefined }"
              :header-crop="headerCrop"
            />
          </div>
        </div>

        <!-- Mobile: collapsible preview -->
        <details
          class="xl:hidden group border border-border rounded-xl overflow-hidden mt-6"
        >
          <summary
            class="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer list-none select-none"
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
              class="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div class="p-4">
            <AdminBlogsPreview
              :data="{ ...previewData, id: blogId ?? undefined }"
              :header-crop="headerCrop"
            />
          </div>
        </details>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for the "Saved ✓" badge */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

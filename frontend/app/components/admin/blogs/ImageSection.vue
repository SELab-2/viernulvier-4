<!--
  components/admin/blogs/ImageSection.vue

  Upload / replace the header image for a blog.
  Uses the same media pipeline as the rest of the app:
    storage → media item → hd_ready crop → gallery → blog link
-->
<script setup lang="ts">
import type { MediaGallery, MediaItem } from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useGallery } from "~/composables/media/useGallery";
import { fetchFullGallery } from "~/utils/galleryFetcher";

const props = defineProps<{ blogId: number }>();

const { t } = useI18n();

const { create: createGallery } = useGalleryApi();
const { create: createItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia } = useStorageApi();
const { getMainImageCrop } = useGallery();
const { get: apiGet, put: apiPut } = useApi();

// ── State ────────────────────────────────────────────────────────────────────
const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const loading = ref(false);
const uploading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// ── Load existing gallery ────────────────────────────────────────────────────
async function loadGallery() {
  loading.value = true;
  error.value = null;
  try {
    const resp = await apiGet<MediaGallery>(
      `/blogs/${props.blogId}/media?type=default`,
    );
    if (resp.data) {
      gallery.value = await fetchFullGallery(
        { ...resp.data, type: "default" },
        "en",
      );
    }
  } catch {
    // 404 = no gallery yet — that's fine
    gallery.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadGallery);

// ── Ensure gallery exists ────────────────────────────────────────────────────
async function ensureGallery(): Promise<MediaGallery> {
  if (gallery.value) return gallery.value as unknown as MediaGallery;

  const checkResp = await apiGet<MediaGallery>(
    `/blogs/${props.blogId}/media?type=default`,
  );
  if (checkResp.data) return checkResp.data;

  const createResp = await createGallery({
    name: `blog-${props.blogId}-gallery`,
    type: "default",
  });
  if (!createResp.data) throw new Error("Failed to create media gallery.");

  const newGallery = createResp.data;
  await apiPut(`/blogs/${props.blogId}/media/${newGallery.id}`, {});
  return newGallery;
}

// ── Upload ────────────────────────────────────────────────────────────────────
async function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    error.value = "Please select an image file (PNG, JPG, WebP…).";
    input.value = "";
    return;
  }

  uploading.value = true;
  error.value = null;
  success.value = null;

  try {
    // 1. Ensure gallery
    const gal = await ensureGallery();

    // 2. Upload to storage
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `/photos/blog-${props.blogId}-${Date.now()}.${ext}`;
    const storeResp = await saveMedia(storagePath, file);
    if (storeResp.error) {
      throw new Error(`Storage upload failed: ${storeResp.error}`);
    }

    // 3. Create media item linked to gallery
    const itemResp = await createItem({
      type: file.type,
      original_filename: file.name,
      position: "main",
      width: 0,
      height: 0,
      gallery_ids: [gal.id],
    });
    if (!itemResp.data) throw new Error("Failed to create media item.");
    const item = itemResp.data as MediaItem;

    // 4. Create hd_ready crop linked to item
    const cropResp = await createCrop({
      name: "hd_ready",
      url: storagePath,
      item_id: item.id,
    });
    if (!cropResp.data) throw new Error("Failed to create media crop.");

    success.value = "Image uploaded successfully.";
    input.value = "";
    await loadGallery();
  } catch (err) {
    console.error("[AdminBlogsImageSection] Upload failed:", err);
    error.value = err instanceof Error ? err.message : "Upload failed.";
  } finally {
    uploading.value = false;
  }
}

// ── Computed ─────────────────────────────────────────────────────────────────
const mainCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "hd_ready") : null,
);
const hasImage = computed(() => !!mainCrop.value);
</script>

<template>
  <div class="rounded-xl border border-card-border bg-card overflow-hidden">
    <!-- Section header -->
    <div class="px-5 py-4 border-b border-card-border bg-card-hover">
      <h2
        class="font-brand font-black text-[13px] uppercase tracking-widest text-card-foreground"
      >
        Header image
      </h2>
      <p class="text-xs text-muted-foreground mt-0.5">
        PNG, JPG or WebP — shown as the story hero and in the list view.
      </p>
    </div>

    <div class="p-5 space-y-4">
      <!-- Skeleton while loading -->
      <div v-if="loading" class="h-40 bg-muted rounded-lg animate-pulse" />

      <!-- Current image -->
      <div
        v-else-if="hasImage"
        class="relative rounded-lg overflow-hidden aspect-[16/5]"
      >
        <MediaDisplay
          :id="blogId"
          :src="mainCrop"
          size="fill"
          :show-icon="false"
          :rounded="false"
          class="w-full h-full object-cover"
        />
        <span
          class="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded"
        >
          Current header
        </span>
      </div>

      <!-- Placeholder when no image -->
      <div
        v-else
        class="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-border text-muted-foreground"
      >
        <svg
          class="w-8 h-8 mb-2 opacity-40"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path
            d="m3 15 4-4 6 6 4-5 4 5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-[11px] font-black uppercase tracking-widest">
          No image yet
        </p>
      </div>

      <!-- Error / success feedback -->
      <div
        v-if="error"
        class="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-4 py-3 text-sm text-red-600 dark:text-red-400"
      >
        {{ error }}
      </div>
      <div
        v-if="success"
        class="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 px-4 py-3 text-sm text-green-600 dark:text-green-400"
      >
        {{ success }}
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />

      <!-- Upload button -->
      <button
        :disabled="uploading"
        class="btn-outline w-full justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="fileInput?.click()"
      >
        <svg
          v-if="uploading"
          class="w-4 h-4 animate-spin shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg
          v-else
          class="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{
          uploading ? "Uploading…" : hasImage ? "Replace image" : "Upload image"
        }}
      </button>
    </div>
  </div>
</template>

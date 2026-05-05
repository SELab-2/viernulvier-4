<!--
  components/admin/blogs/ImageSection.vue
  ==========================================
  Step 2 of the blog edit flow: manages the media gallery and all image crops
  for a blog post.

  Architecture overview:
  ┌─ ImageSection (this file) ──────────────────────────────────────────────┐
  │  Owns: gallery lifecycle, item lifecycle, upload/delete API calls,      │
  │         feedback state, metadata save.                                  │
  │                                                                         │
  │  ┌── AdminBlogsCropGrid ──────────────────────────────────────────┐     │
  │  │  Renders the 6 named crop slots, wires hidden file inputs,     │     │
  │  │  emits 'upload' and 'delete' back up.                          │     │
  │  └────────────────────────────────────────────────────────────────┘     │
  │                                                                         │
  │  ┌── AdminBlogsItemMetadata ──────────────────────────────────────┐     │
  │  │  Form for title (NL/EN) + credits (NL/EN) on the media item.   │     │
  │  │  Emits 'save' back up.                                         │     │
  │  └────────────────────────────────────────────────────────────────┘     │
  └─────────────────────────────────────────────────────────────────────────┘

  Data model:
  - One blog  →  one MediaGallery (type "default")
                     →  one MediaItem (position "main")
                             →  up to 6 named MediaCrops

  Lazy creation:
  The gallery and item are created on-demand the first time the user uploads a
  crop, so a freshly created blog doesn't need a gallery until photos are added.
-->

<script setup lang="ts">
import type { MediaGallery, MediaItem, MediaCrop } from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import type {
  GalleryWithItems,
  ItemViewWithCrops,
} from "~/utils/galleryFetcher";

// Crop names

/**
 * All six named crop slots that can be uploaded for a blog's media item.
 * These must match the CropName enum on the backend.
 */
const CROP_NAMES = [
  "hd_ready",
  "FE3_header",
  "thumbnail",
  "og_image",
  "mobile",
  "nb_ready",
] as const;
type CropName = (typeof CROP_NAMES)[number];

// Props & emits

const props = defineProps<{
  /** ID of the blog post whose images we are managing. */
  blogId: number;
}>();

const emit = defineEmits<{
  /**
   * Fired after any crop is successfully uploaded or deleted.
   * The parent edit page listens to this to refresh its headerCrop preview.
   */
  (e: "crop-uploaded"): void;
}>();

// Composables

const { t, locale } = useI18n();
const { create: createGallery } = useGalleryApi();
const { create: createItem, modify: modifyItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia, deleteMedia } = useStorageApi();
const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();

// State

/** The MediaGallery linked to this blog (null until loaded or lazily created). */
const gallery = ref<MediaGallery | null>(null);
/** The single MediaItem inside the gallery. */
const mediaItem = ref<MediaItem | null>(null);
/** Map of currently uploaded crops keyed by CropName. */
const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});

const loadingGallery = ref(false);
/** Name of the crop currently being uploaded (drives per-slot spinners). */
const uploadingCrop = ref<CropName | null>(null);
/** Name of the crop currently being deleted. */
const deletingCrop = ref<CropName | null>(null);

/** Inline feedback message shown below the card header. */
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

// Editable metadata fields — populated from the fetched item on load.
const itemTitleNl = ref("");
const itemTitleEn = ref("");
const itemCreditsNl = ref("");
const itemCreditsEn = ref("");
const savingMetadata = ref(false);

// Feedback helpers

/**
 * Show a transient feedback banner for 4 seconds then auto-dismiss it.
 * @param type  'ok' = green success, 'err' = red error
 * @param msg   localised message string
 */
function setFeedback(type: "ok" | "err", msg: string) {
  feedback.value = { type, msg };
  setTimeout(() => {
    feedback.value = null;
  }, 4000);
}

// Gallery / item loading

/**
 * Load the gallery and its first media item on mount.
 * Populates `gallery`, `mediaItem`, `existingCrops`, and the metadata fields.
 */
async function loadGalleryAndItem() {
  loadingGallery.value = true;
  try {
    const fullGallery = await getMediaGallery(props.blogId, locale.value);
    if (!fullGallery) {
      // No gallery linked yet — that's fine, we create one lazily on first upload.
      gallery.value = null;
      mediaItem.value = null;
      existingCrops.value = {};
      return;
    }

    gallery.value = fullGallery;

    const firstItem = fullGallery.items[0];
    if (!firstItem) {
      mediaItem.value = null;
      existingCrops.value = {};
      return;
    }

    // Build a plain MediaItem from the view so we can call modifyItem later.
    // The gallery returns MediaItemView (flattened strings), but modifyItem
    // expects a MediaItem — the shape is compatible for the fields we use.
    mediaItem.value = {
      id: firstItem.id,
      type: firstItem.type,
      original_filename: firstItem.original_filename,
      position: firstItem.position,
      width: firstItem.width,
      height: firstItem.height,
      title: firstItem.title,
      description: firstItem.description,
      credits: firstItem.credits,
      created_at: firstItem.created_at,
      updated_at: firstItem.updated_at,
    } as MediaItem;

    // Populate the metadata form from the fetched item.
    const title = firstItem.title as { nl?: string; en?: string } | null;
    const credits = firstItem.credits as { nl?: string; en?: string } | null;
    itemTitleNl.value = title?.nl ?? "";
    itemTitleEn.value = title?.en ?? "";
    itemCreditsNl.value = credits?.nl ?? "";
    itemCreditsEn.value = credits?.en ?? "";

    // existingCrops is a dictionary keyed by CropName (see galleryFetcher.ts).
    existingCrops.value = (firstItem as ItemViewWithCrops).crops as Partial<
      Record<CropName, MediaCrop>
    >;
  } catch {
    gallery.value = null;
    mediaItem.value = null;
    existingCrops.value = {};
  } finally {
    loadingGallery.value = false;
  }
}

onMounted(loadGalleryAndItem);

// Lazy gallery / item creation

/**
 * Ensure a gallery and media item exist before uploading a crop.
 * Creates them if they don't exist yet, re-fetching from the server first
 * to handle races (e.g. two crops uploaded in quick succession).
 *
 * Returns the gallery and item that are safe to use.
 */
async function ensureGalleryAndItem(): Promise<{
  gallery: MediaGallery;
  item: MediaItem;
}> {
  // 1. Ensure gallery
  let gal = gallery.value;
  if (!gal) {
    const fresh = await getMediaGallery(props.blogId, locale.value);
    if (fresh) {
      gallery.value = fresh;
      gal = fresh;
    } else {
      const result = await createGallery({
        name: `blog-${props.blogId}-gallery`,
        type: "default",
      });
      if (!result.data) throw new Error(t("admin.blogs.image.galleryError"));
      gal = result.data as MediaGallery;
      gallery.value = gal;
      await linkMediaToBlog(props.blogId, gal.id);
    }
  }

  // 2. Ensure item
  let item = mediaItem.value;
  if (!item) {
    const fresh = await getMediaGallery(props.blogId, locale.value);
    const freshItem = fresh?.items?.[0];
    if (freshItem) {
      item = freshItem as unknown as MediaItem;
      mediaItem.value = item;
    } else {
      const result = await createItem({
        type: "image",
        original_filename: `blog-${props.blogId}-main`,
        position: "main",
        width: 0,
        height: 0,
        title: { nl: "", en: "" },
        description: { nl: "", en: "" },
        credits: { nl: "", en: "" },
        gallery_ids: [gal.id],
      });
      if (!result.data) throw new Error(t("admin.blogs.image.itemError"));
      item = result.data as MediaItem;
      mediaItem.value = item;
    }
  }

  return { gallery: gal, item };
}

// Upload

/**
 * Handle a file upload for a specific crop slot.
 * Called by CropGrid via the 'upload' event.
 *
 * Flow:
 * 1. Validate file type (image only)
 * 2. Ensure gallery + item exist (lazy creation)
 * 3. Upload file to storage via useStorageApi
 * 4. Create a MediaCrop record linking the file to the item
 * 5. Update local state and emit 'crop-uploaded' to parent
 */
async function handleUpload(cropName: CropName, file: File) {
  if (!file.type.startsWith("image/")) {
    setFeedback("err", t("admin.blogs.image.typeError"));
    return;
  }

  uploadingCrop.value = cropName;
  feedback.value = null;

  try {
    const { item } = await ensureGalleryAndItem();

    // Build a unique storage path to avoid collisions across blogs / crops.
    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `/photos/blog-${props.blogId}-${cropName}-${Date.now()}.${ext}`;

    const storeResult = await saveMedia(storagePath, file);
    if (storeResult.error) throw new Error(storeResult.error);

    const cropResult = await createCrop({
      name: cropName as any,
      url: storagePath,
      item_id: item.id,
    });
    if (!cropResult.data) throw new Error(t("admin.blogs.image.cropError"));

    // Merge the new crop into the local map without a full reload.
    existingCrops.value = {
      ...existingCrops.value,
      [cropName]: cropResult.data as MediaCrop,
    };
    setFeedback("ok", t("admin.blogs.image.uploadSuccess", { name: cropName }));
    emit("crop-uploaded");
  } catch (err) {
    setFeedback(
      "err",
      err instanceof Error ? err.message : t("admin.blogs.image.uploadError"),
    );
  } finally {
    uploadingCrop.value = null;
  }
}

// Delete

/**
 * Delete a crop slot after confirmation.
 * Removes the file from storage and clears it from the local map.
 * Called by CropGrid via the 'delete' event.
 */
async function handleDeleteCrop(cropName: CropName) {
  const crop = existingCrops.value[cropName];
  if (!crop) return;

  if (!confirm(t("admin.blogs.image.deleteConfirmCrop", { name: cropName })))
    return;

  deletingCrop.value = cropName;
  try {
    if (crop.url) await deleteMedia(crop.url);

    // Remove from local map.
    const updated = { ...existingCrops.value };
    delete updated[cropName];
    existingCrops.value = updated;

    setFeedback("ok", t("admin.blogs.image.removed", { name: cropName }));
    emit("crop-uploaded");
  } catch (err) {
    setFeedback(
      "err",
      err instanceof Error ? err.message : t("admin.blogs.image.uploadError"),
    );
  } finally {
    deletingCrop.value = null;
  }
}

// Metadata save

/**
 * Save the title and credits fields on the media item.
 * English fields fall back to Dutch when left empty (consistent with blog titles).
 */
async function saveMetadata() {
  if (!mediaItem.value) return;
  savingMetadata.value = true;
  try {
    await modifyItem(mediaItem.value.id, {
      title: {
        nl: itemTitleNl.value,
        en: itemTitleEn.value || itemTitleNl.value,
      },
      credits: {
        nl: itemCreditsNl.value,
        en: itemCreditsEn.value || itemCreditsNl.value,
      },
    });
    setFeedback("ok", t("admin.blogs.image.metadataSaved"));
  } catch {
    setFeedback("err", t("admin.blogs.image.uploadError"));
  } finally {
    savingMetadata.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Crop grid card -->
    <div class="rounded-xl border border-card-border bg-card overflow-hidden">
      <!-- Card header -->
      <div
        class="flex items-center justify-between gap-4 px-5 py-4 border-b border-card-border bg-card-hover"
      >
        <div class="flex items-center gap-3">
          <div class="w-1 h-5 rounded-full bg-accent shrink-0" />
          <div>
            <h2
              class="font-brand font-black text-[11px] uppercase tracking-widest text-foreground"
            >
              {{ t("admin.blogs.image.multiTitle") }}
            </h2>
            <p class="text-[10px] text-muted-foreground mt-0.5">
              {{ t("admin.blogs.image.multiSubtitle") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Transient feedback banner (success or error) -->
      <Transition name="slide-down">
        <div
          v-if="feedback"
          :class="[
            'mx-5 mt-4 rounded-lg border px-4 py-2.5 text-sm',
            feedback.type === 'ok'
              ? 'border-feedback-success-border bg-feedback-success-bg text-feedback-success-text'
              : 'border-feedback-error-border bg-feedback-error-bg text-feedback-error-text',
          ]"
        >
          {{ feedback.msg }}
        </div>
      </Transition>

      <!--
        CropGrid handles the 6 crop slots, file-input wiring, and per-slot
        spinners. It emits 'upload' and 'delete' which we handle above.
      -->
      <div class="p-5">
        <AdminBlogsCropGrid
          :blog-id="blogId"
          :existing-crops="existingCrops"
          :uploading-crop="uploadingCrop"
          :deleting-crop="deletingCrop"
          :loading="loadingGallery"
          @upload="handleUpload"
          @delete="handleDeleteCrop"
        />
      </div>
    </div>

    <!-- Item metadata card -->
    <!--
      Only shown once the loading phase is complete (even if no item exists yet).
      AdminBlogsItemMetadata is disabled when mediaItem is null so the user
      can't save before the item has been created by the first upload.
    -->
    <AdminBlogsItemMetadata
      v-if="!loadingGallery"
      v-model:title-nl="itemTitleNl"
      v-model:title-en="itemTitleEn"
      v-model:credits-nl="itemCreditsNl"
      v-model:credits-en="itemCreditsEn"
      :disabled="!mediaItem"
      :saving="savingMetadata"
      @save="saveMetadata"
    />
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

/**
 * composables/blogs/useImageSection.ts
 * ======================================
 * Encapsulates all gallery and media-item API interactions needed by the
 * blog image-upload step.
 *
 * Responsibilities:
 * - Loading the existing gallery and its first media item on mount.
 * - Lazy-creating the gallery and item the first time a crop is uploaded.
 * - Uploading a new crop file to storage and registering it as a MediaCrop.
 * - Deleting an existing crop from storage and clearing it locally.
 * - Saving title and credits metadata on the media item.
 *
 * All state that drives the UI (loading flags, crop map, metadata fields,
 * feedback banner) is exposed as reactive refs so the consuming component
 * only needs to handle layout and user events.
 */

import type {
  CreateMediaCrop,
  MediaGallery,
  MediaItem,
  MediaCrop,
} from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useBlogApi } from "~/composables/blogs/useBlogApi";

// Named crop slots supported by the backend.
export const CROP_NAMES = [
  "hd_ready",
  "FE3_header",
  "thumbnail",
  "og_image",
  "mobile",
  "nb_ready",
] as const;

export type CropName = (typeof CROP_NAMES)[number];

export function useImageSection(
  blogId: number,
  emit: (e: "crop-uploaded") => void,
) {
  const { t, locale } = useI18n();
  const { create: createGallery } = useGalleryApi();
  const { create: createItem, modify: modifyItem } = useItemApi();
  const { create: createCrop } = useCropApi();
  const { saveMedia, deleteMedia } = useStorageApi();
  const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();

  // Gallery and item references.
  const gallery = ref<MediaGallery | null>(null);
  const mediaItem = ref<MediaItem | null>(null);

  // Map of existing crops keyed by CropName.
  const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});

  // Per-operation loading flags that drive per-slot spinners.
  const loadingGallery = ref(false);
  const uploadingCrop = ref<CropName | null>(null);
  const deletingCrop = ref<CropName | null>(null);

  // Transient feedback banner state.
  const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

  // Editable metadata fields populated from the fetched media item.
  const itemTitleNl = ref("");
  const itemTitleEn = ref("");
  const itemCreditsNl = ref("");
  const itemCreditsEn = ref("");
  const savingMetadata = ref(false);

  // Show a feedback banner that auto-dismisses after four seconds.
  function setFeedback(type: "ok" | "err", msg: string) {
    feedback.value = { type, msg };
    setTimeout(() => {
      feedback.value = null;
    }, 4000);
  }

  // Load the gallery and first media item, then populate state from the response.
  async function loadGalleryAndItem() {
    loadingGallery.value = true;
    try {
      const fullGallery = await getMediaGallery(blogId, locale.value);

      if (!fullGallery) {
        // No gallery linked yet — first upload will create it lazily.
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

      // Build a MediaItem-compatible object from the view for later use with modifyItem.
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

      // Populate the metadata form.
      const title = firstItem.title as { nl?: string; en?: string } | null;
      const credits = firstItem.credits as { nl?: string; en?: string } | null;
      itemTitleNl.value = title?.nl ?? "";
      itemTitleEn.value = title?.en ?? "";
      itemCreditsNl.value = credits?.nl ?? "";
      itemCreditsEn.value = credits?.en ?? "";

      // Build the crop dictionary from the view's crops map.
      const crops = (
        firstItem as { crops?: Partial<Record<CropName, MediaCrop>> }
      ).crops;
      existingCrops.value = crops ?? {};
    } catch {
      gallery.value = null;
      mediaItem.value = null;
      existingCrops.value = {};
    } finally {
      loadingGallery.value = false;
    }
  }

  /**
   * Ensure a gallery and media item exist before uploading a crop.
   * Creates them lazily if they are not present yet, re-fetching from the
   * server first to handle concurrent uploads gracefully.
   */
  async function ensureGalleryAndItem(): Promise<{
    gallery: MediaGallery;
    item: MediaItem;
  }> {
    // Ensure gallery exists.
    let gal = gallery.value;
    if (!gal) {
      const fresh = await getMediaGallery(blogId, locale.value);
      if (fresh) {
        gallery.value = fresh;
        gal = fresh;
      } else {
        const result = await createGallery({
          name: `blog-${blogId}-gallery`,
          type: "default",
        });
        if (!result.data) throw new Error(t("admin.blogs.image.galleryError"));
        gal = result.data;
        gallery.value = gal;
        await linkMediaToBlog(blogId, gal.id);
      }
    }

    // Ensure media item exists inside the gallery.
    let item = mediaItem.value;
    if (!item) {
      const fresh = await getMediaGallery(blogId, locale.value);
      const freshItem = fresh?.items?.[0];
      if (freshItem) {
        item = freshItem as unknown as MediaItem;
        mediaItem.value = item;
      } else {
        const result = await createItem({
          type: "image",
          original_filename: `blog-${blogId}-main`,
          position: "main",
          width: 0,
          height: 0,
          title: { nl: "", en: "" },
          description: { nl: "", en: "" },
          credits: { nl: "", en: "" },
          gallery_ids: [gal.id],
        });
        if (!result.data) throw new Error(t("admin.blogs.image.itemError"));
        item = result.data;
        mediaItem.value = item;
      }
    }

    return { gallery: gal, item };
  }

  // Upload a file for a specific crop slot.
  async function handleUpload(cropName: CropName, file: File) {
    if (!file.type.startsWith("image/")) {
      setFeedback("err", t("admin.blogs.image.typeError"));
      return;
    }

    uploadingCrop.value = cropName;
    feedback.value = null;

    try {
      const { item } = await ensureGalleryAndItem();

      // Build a unique path so crops from different blogs never collide.
      const ext = file.name.split(".").pop() ?? "jpg";
      const storagePath = `/photos/blog-${blogId}-${cropName}-${Date.now()}.${ext}`;

      const storeResult = await saveMedia(storagePath, file);
      if (storeResult.error) throw new Error(storeResult.error);

      const cropResult = (await createCrop({
        name: cropName as CreateMediaCrop["name"],
        url: storagePath,
        item_id: item.id,
      })) as { data?: MediaCrop };
      const createdCrop = cropResult.data;
      if (!createdCrop) throw new Error(t("admin.blogs.image.cropError"));

      // Merge into the local map without a full reload.
      existingCrops.value = {
        ...existingCrops.value,
        [cropName]: createdCrop,
      };

      setFeedback(
        "ok",
        t("admin.blogs.image.uploadSuccess", { name: cropName }),
      );
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

  // Delete a crop after the user has confirmed the action.
  async function handleDeleteCrop(cropName: CropName) {
    const crop = existingCrops.value[cropName];
    if (!crop) return;

    if (!confirm(t("admin.blogs.image.deleteConfirmCrop", { name: cropName })))
      return;

    deletingCrop.value = cropName;
    try {
      if (crop.url) await deleteMedia(crop.url);

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

  // Save title and credits on the media item. English falls back to Dutch.
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

  return {
    // State
    gallery,
    mediaItem,
    existingCrops,
    loadingGallery,
    uploadingCrop,
    deletingCrop,
    feedback,
    itemTitleNl,
    itemTitleEn,
    itemCreditsNl,
    itemCreditsEn,
    savingMetadata,

    // Actions
    loadGalleryAndItem,
    handleUpload,
    handleDeleteCrop,
    saveMetadata,
  };
}

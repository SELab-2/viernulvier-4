<script setup lang="ts">
import type { MediaGallery, MediaItem, MediaCrop } from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import { API_ROUTES } from "~/utils/apiRoutes";
import type {
  GalleryWithItems,
  ItemViewWithCrops,
} from "~/utils/galleryFetcher";

const CROP_SLOTS = [
  {
    name: "hd_ready",
    labelKey: "admin.blogs.image.cropHdReady",
    hintKey: "admin.blogs.image.cropHdReadyHint",
  },
  {
    name: "FE3_header",
    labelKey: "admin.blogs.image.cropHeader",
    hintKey: "admin.blogs.image.cropHeaderHint",
  },
  {
    name: "thumbnail",
    labelKey: "admin.blogs.image.cropThumbnail",
    hintKey: "admin.blogs.image.cropThumbnailHint",
  },
  {
    name: "og_image",
    labelKey: "admin.blogs.image.cropOg",
    hintKey: "admin.blogs.image.cropOgHint",
  },
  {
    name: "mobile",
    labelKey: "admin.blogs.image.cropMobile",
    hintKey: "admin.blogs.image.cropMobileHint",
  },
  {
    name: "nb_ready",
    labelKey: "admin.blogs.image.cropNb",
    hintKey: "admin.blogs.image.cropNbHint",
  },
] as const;

type CropName = (typeof CROP_SLOTS)[number]["name"];

const props = defineProps<{ blogId: number }>();

const emit = defineEmits<{
  /** Fired after every successful upload or delete — parent should reload gallery */
  (e: "crop-uploaded"): void;
}>();

const { t, locale } = useI18n();
const { create: createGallery } = useGalleryApi();
const { create: createItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia, deleteMedia } = useStorageApi();
const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();
const { getMainImageCrop } = useGallery();

// Gallery state — loaded via useBlogApi (reuses the standard composable path)
const fullGallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const gallery = ref<MediaGallery | null>(null);
const mediaItem = ref<MediaItem | null>(null);
const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});

const loadingGallery = ref(false);
const uploadingCrop = ref<CropName | null>(null);
const deletingCrop = ref<CropName | null>(null);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

function setFeedback(type: "ok" | "err", msg: string) {
  feedback.value = { type, msg };
  setTimeout(() => {
    feedback.value = null;
  }, 4000);
}

/**
 * Load the gallery using the standard useBlogApi composable.
 * getMediaGallery returns a GalleryWithItems<ItemViewWithCrops> that already
 * contains items + crops — no need for manual sequential API calls.
 */
async function loadGalleryAndItem() {
  loadingGallery.value = true;
  try {
    fullGallery.value = await getMediaGallery(props.blogId, locale.value);

    if (!fullGallery.value) {
      gallery.value = null;
      mediaItem.value = null;
      existingCrops.value = {};
      return;
    }

    // Persist the base gallery reference for gallery ID access
    gallery.value = fullGallery.value;

    const items = fullGallery.value.items;
    if (!items.length) {
      mediaItem.value = null;
      existingCrops.value = {};
      return;
    }

    // The first item holds all the crops we need
    const item = items[0]!;
    // MediaItem shape without the crops dictionary
    mediaItem.value = {
      id: item.id,
      type: item.type,
      original_filename: item.original_filename,
      position: item.position,
      width: item.width,
      height: item.height,
      title: item.title,
      description: item.description,
      credits: item.credits,
      created_at: item.created_at,
      updated_at: item.updated_at,
    } as MediaItem;

    // item.crops is already a Partial<Record<CropName, MediaCrop>> from galleryFetcher
    existingCrops.value = item.crops as Partial<Record<CropName, MediaCrop>>;
  } catch {
    gallery.value = null;
    mediaItem.value = null;
    existingCrops.value = {};
  } finally {
    loadingGallery.value = false;
  }
}

onMounted(loadGalleryAndItem);

/**
 * Ensures a gallery + one MediaItem exist, creating them if needed.
 * Uses the standard composable helpers instead of raw apiGet calls.
 */
async function ensureGalleryAndItem(): Promise<{
  gallery: MediaGallery;
  item: MediaItem;
}> {
  // 1. Ensure gallery exists — try to reload first
  let gal = gallery.value;
  if (!gal) {
    const fresh = await getMediaGallery(props.blogId, locale.value);
    if (fresh) {
      gallery.value = fresh;
      gal = fresh;
    } else {
      // Create a new gallery and link it to the blog
      const createResp = await createGallery({
        name: `blog-${props.blogId}-gallery`,
        type: "default",
      });
      if (!createResp.data)
        throw new Error(t("admin.blogs.image.galleryError"));
      gal = createResp.data as MediaGallery;
      gallery.value = gal;
      await linkMediaToBlog(props.blogId, gal.id);
    }
  }

  // 2. Ensure a single MediaItem exists in this gallery
  let item = mediaItem.value;
  if (!item) {
    // Re-fetch via the full gallery to see if an item was created in another session
    const fresh = await getMediaGallery(props.blogId, locale.value);
    const freshItem = fresh?.items?.[0];

    if (freshItem) {
      item = {
        id: freshItem.id,
        type: freshItem.type,
        original_filename: freshItem.original_filename,
        position: freshItem.position,
        width: freshItem.width,
        height: freshItem.height,
        title: freshItem.title,
        description: freshItem.description,
        credits: freshItem.credits,
        created_at: freshItem.created_at,
        updated_at: freshItem.updated_at,
      } as MediaItem;
      mediaItem.value = item;
    } else {
      // TODO: expose title, description and credits inputs so editors can fill
      //       in proper metadata when creating the item, rather than empty strings.
      const createResp = await createItem({
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
      if (!createResp.data) throw new Error(t("admin.blogs.image.itemError"));
      item = createResp.data as MediaItem;
      mediaItem.value = item;
    }
  }

  return { gallery: gal, item };
}

const fileInputs = ref<Partial<Record<CropName, HTMLInputElement | null>>>({});

function triggerUpload(cropName: CropName) {
  fileInputs.value[cropName]?.click();
}

async function handleFileChange(e: Event, cropName: CropName) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  input.value = "";

  if (!file.type.startsWith("image/")) {
    setFeedback("err", t("admin.blogs.image.typeError"));
    return;
  }

  uploadingCrop.value = cropName;
  feedback.value = null;

  try {
    const { item } = await ensureGalleryAndItem();

    const ext = file.name.split(".").pop() ?? "jpg";
    const storagePath = `/photos/blog-${props.blogId}-${cropName}-${Date.now()}.${ext}`;

    const storeResp = await saveMedia(storagePath, file);
    if (storeResp.error) throw new Error(storeResp.error);

    const cropResp = await createCrop({
      name: cropName as any,
      url: storagePath,
      item_id: item.id,
    });
    if (!cropResp.data) throw new Error(t("admin.blogs.image.cropError"));

    existingCrops.value = {
      ...existingCrops.value,
      [cropName]: cropResp.data as MediaCrop,
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

async function handleDeleteCrop(cropName: CropName) {
  const crop = existingCrops.value[cropName];
  if (!crop) return;
  if (!confirm(t("admin.blogs.image.deleteConfirmCrop", { name: cropName })))
    return;

  deletingCrop.value = cropName;
  try {
    if (crop.url) await deleteMedia(crop.url);
    const newMap = { ...existingCrops.value };
    delete newMap[cropName];
    existingCrops.value = newMap;
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

/**
 * Returns a MediaCrop-shaped object (or null) for use with MediaDisplay.
 * MediaDisplay accepts a null src and handles the placeholder itself,
 * so we don't need a separate cropUrl() helper.
 */
function cropForSlot(cropName: CropName): MediaCrop | null {
  return existingCrops.value[cropName] ?? null;
}

const uploadedCount = computed(
  () => CROP_SLOTS.filter((s) => !!existingCrops.value[s.name]).length,
);
</script>

<template>
  <div class="rounded-xl border border-card-border bg-card overflow-hidden">
    <!-- Header -->
    <div
      class="px-5 py-4 border-b border-card-border bg-card-hover flex items-center justify-between gap-4"
    >
      <div>
        <h2
          class="font-brand font-black text-[13px] uppercase tracking-widest text-card-foreground"
        >
          {{ t("admin.blogs.image.multiTitle") }}
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ t("admin.blogs.image.multiSubtitle") }}
        </p>
      </div>
      <span
        class="shrink-0 text-[11px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ uploadedCount }} / {{ CROP_SLOTS.length }}
      </span>
    </div>

    <!-- Loading skeleton -->
    <div
      v-if="loadingGallery"
      class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-32 bg-muted rounded-lg animate-pulse"
      />
    </div>

    <div v-else class="p-5 space-y-4">
      <!-- Feedback banner -->
      <div
        v-if="feedback"
        :class="[
          'rounded-lg border px-4 py-3 text-sm',
          feedback.type === 'ok'
            ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400'
            : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400',
        ]"
      >
        {{ feedback.msg }}
      </div>

      <!-- Crop grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="slot in CROP_SLOTS"
          :key="slot.name"
          class="rounded-lg border border-card-border overflow-hidden bg-background"
        >
          <!-- Preview area — uses MediaDisplay which handles placeholder automatically -->
          <div class="relative aspect-[16/7]">
            <MediaDisplay
              :id="blogId"
              :src="cropForSlot(slot.name as CropName)"
              size="fill"
              :show-icon="true"
              :show-border="false"
              :rounded="false"
              class="w-full h-full"
            />

            <!-- Spinner overlay while uploading / deleting -->
            <div
              v-if="uploadingCrop === slot.name || deletingCrop === slot.name"
              class="absolute inset-0 bg-black/40 flex items-center justify-center z-10"
            >
              <svg
                class="w-6 h-6 animate-spin text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>

            <!-- Uploaded badge -->
            <span
              v-if="existingCrops[slot.name as CropName]"
              class="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded z-10"
            >
              ✓ {{ t("admin.blogs.image.uploaded") }}
            </span>
          </div>

          <!-- Crop info & actions -->
          <div class="px-3 py-2.5 space-y-1">
            <p
              class="text-[11px] font-brand font-black uppercase tracking-widest text-foreground"
            >
              {{ t(slot.labelKey) }}
            </p>
            <p class="text-[10px] text-muted-foreground leading-tight">
              {{ t(slot.hintKey) }}
            </p>

            <div class="flex gap-2 pt-1">
              <button
                :disabled="
                  uploadingCrop === slot.name || deletingCrop === slot.name
                "
                class="btn-outline flex-1 justify-center text-[10px] h-8 px-3 gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                @click="triggerUpload(slot.name as CropName)"
              >
                <svg
                  class="w-3 h-3 shrink-0"
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
                  existingCrops[slot.name as CropName]
                    ? t("admin.blogs.image.replace")
                    : t("admin.blogs.image.upload")
                }}
              </button>

              <button
                v-if="existingCrops[slot.name as CropName]"
                :disabled="
                  deletingCrop === slot.name || uploadingCrop === slot.name
                "
                class="h-8 w-8 shrink-0 flex items-center justify-center rounded-md border border-action-red-border text-action-red-icon hover:bg-action-red-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                :title="t('admin.delete')"
                @click="handleDeleteCrop(slot.name as CropName)"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Hidden file input -->
          <input
            :ref="
              (el) => {
                fileInputs[slot.name as CropName] =
                  el as HTMLInputElement | null;
              }
            "
            type="file"
            accept="image/*"
            class="hidden"
            @change="(e) => handleFileChange(e, slot.name as CropName)"
          />
        </div>
      </div>

      <p class="text-[10px] text-muted-foreground text-center pt-1">
        {{ t("admin.blogs.image.allBelongNote") }}
      </p>
    </div>
  </div>
</template>

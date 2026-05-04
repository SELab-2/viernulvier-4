<!--
  components/admin/blogs/ImageSection.vue
  =========================================
  Step 2 of the blog edit flow: manages all image crops for a blog's media
  gallery. Each blog has one MediaGallery → one MediaItem → up to 6 named crops.

  Also allows editing the media item's title, description, and credits using
  the shared BaseInput and BaseTextArea form components.

  Note: "Link to production" has been moved to its own card in the edit page
  to keep concerns separated and reduce the size of this component.
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

// All six crop slots with their i18n label and hint keys.
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
const emit = defineEmits<{ (e: "crop-uploaded"): void }>();

const { t, locale } = useI18n();
const { create: createGallery } = useGalleryApi();
const { create: createItem, modify: modifyItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia, deleteMedia } = useStorageApi();
const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();

// State
const gallery = ref<MediaGallery | null>(null);
const mediaItem = ref<MediaItem | null>(null);
const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});
const loadingGallery = ref(false);
const uploadingCrop = ref<CropName | null>(null);
const deletingCrop = ref<CropName | null>(null);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

// Editable item metadata fields — populated from the fetched item.
const itemTitleNl = ref("");
const itemTitleEn = ref("");
const itemCreditsNl = ref("");
const itemCreditsEn = ref("");
const savingMetadata = ref(false);

function setFeedback(type: "ok" | "err", msg: string) {
  feedback.value = { type, msg };
  setTimeout(() => {
    feedback.value = null;
  }, 4000);
}

// Load the existing gallery and its first item (if any).
async function loadGalleryAndItem() {
  loadingGallery.value = true;
  try {
    const fullGallery = await getMediaGallery(props.blogId, locale.value);
    if (!fullGallery) {
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

    // Populate metadata form fields from the fetched item.
    const title = firstItem.title as { nl?: string; en?: string } | null;
    const credits = firstItem.credits as { nl?: string; en?: string } | null;
    itemTitleNl.value = title?.nl ?? "";
    itemTitleEn.value = title?.en ?? "";
    itemCreditsNl.value = credits?.nl ?? "";
    itemCreditsEn.value = credits?.en ?? "";

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

// Ensure a gallery and item exist before uploading, creating them lazily.
async function ensureGalleryAndItem(): Promise<{
  gallery: MediaGallery;
  item: MediaItem;
}> {
  let gal = gallery.value;
  if (!gal) {
    const freshGallery = await getMediaGallery(props.blogId, locale.value);
    if (freshGallery) {
      gallery.value = freshGallery;
      gal = freshGallery;
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

  let item = mediaItem.value;
  if (!item) {
    // Check again after possibly creating the gallery.
    const freshGallery = await getMediaGallery(props.blogId, locale.value);
    const freshItem = freshGallery?.items?.[0];
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

// Save the title and credits fields on the media item.
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

// File input refs keyed by crop name.
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

    const storeResult = await saveMedia(storagePath, file);
    if (storeResult.error) throw new Error(storeResult.error);

    const cropResult = await createCrop({
      name: cropName as any,
      url: storagePath,
      item_id: item.id,
    });
    if (!cropResult.data) throw new Error(t("admin.blogs.image.cropError"));

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

const cropForSlot = (cropName: CropName): MediaCrop | null =>
  existingCrops.value[cropName] ?? null;

const uploadedCount = computed(
  () => CROP_SLOTS.filter((s) => !!existingCrops.value[s.name]).length,
);
</script>

<template>
  <div class="space-y-4">
    <!-- Crops card -->
    <div class="rounded-xl border border-card-border bg-card overflow-hidden">
      <!-- Header with circular progress indicator -->
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
        <div class="shrink-0 relative w-10 h-10">
          <svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke-width="3"
              class="stroke-border"
            />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke-width="3"
              class="stroke-accent transition-all duration-500"
              stroke-linecap="round"
              :stroke-dasharray="`${(uploadedCount / CROP_SLOTS.length) * 97.4} 97.4`"
            />
          </svg>
          <span
            class="absolute inset-0 flex items-center justify-center text-[9px] font-black text-foreground"
          >
            {{ uploadedCount }}/{{ CROP_SLOTS.length }}
          </span>
        </div>
      </div>

      <!-- Feedback banner -->
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

      <!-- Loading skeleton -->
      <div
        v-if="loadingGallery"
        class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="h-40 bg-muted rounded-lg animate-pulse"
        />
      </div>

      <!-- Crop grid -->
      <div v-else class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AdminBlogsCropSlot
            v-for="slot in CROP_SLOTS"
            :key="slot.name"
            :crop-name="slot.name"
            :label="t(slot.labelKey)"
            :hint="t(slot.hintKey)"
            :crop="cropForSlot(slot.name as CropName)"
            :uploading="uploadingCrop === slot.name"
            :deleting="deletingCrop === slot.name"
            :blog-id="blogId"
            @trigger-upload="triggerUpload(slot.name as CropName)"
            @delete="handleDeleteCrop(slot.name as CropName)"
          >
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
          </AdminBlogsCropSlot>
        </div>
        <p class="text-[9px] text-muted-foreground text-center pt-4">
          {{ t("admin.blogs.image.allBelongNote") }}
        </p>
      </div>
    </div>

    <!-- Item metadata card — title and credits for the media item -->
    <div
      v-if="mediaItem || !loadingGallery"
      class="rounded-xl border border-card-border bg-card overflow-hidden"
    >
      <div
        class="flex items-center gap-3 px-5 py-4 border-b border-card-border bg-card-hover"
      >
        <div class="w-1 h-5 rounded-full bg-accent shrink-0" />
        <h2
          class="font-brand font-black text-[11px] uppercase tracking-widest text-foreground"
        >
          {{ t("admin.blogs.image.metadataTitle") }}
        </h2>
      </div>
      <div class="p-5 space-y-0">
        <FormFieldsBaseInput
          v-model="itemTitleNl"
          :label="t('admin.blogs.image.itemTitleNl')"
        />
        <FormFieldsBaseInput
          v-model="itemTitleEn"
          :label="t('admin.blogs.image.itemTitleEn')"
        />
        <FormFieldsBaseInput
          v-model="itemCreditsNl"
          :label="t('admin.blogs.image.itemCreditsNl')"
        />
        <FormFieldsBaseInput
          v-model="itemCreditsEn"
          :label="t('admin.blogs.image.itemCreditsEn')"
        />
        <div class="flex justify-end px-4 pb-2">
          <button
            type="button"
            :disabled="savingMetadata || !mediaItem"
            class="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            @click="saveMetadata"
          >
            {{ savingMetadata ? t("admin.saving") : t("admin.save") }}
          </button>
        </div>
      </div>
    </div>
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

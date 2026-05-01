<!--
  components/admin/blogs/ImageSection.vue

  Step 2 of the blog edit flow: media management.
  Simplified: only shows the 6 crop slots. Item metadata removed.

  One blog → one MediaGallery (type "default") → ONE MediaItem → up to 6 crops.
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

// Crop slot definitions
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

//  Props / emits
const props = defineProps<{ blogId: number }>();
const emit = defineEmits<{ (e: "crop-uploaded"): void }>();

// Composables
const { t, locale } = useI18n();
const { create: createGallery } = useGalleryApi();
const { create: createItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia, deleteMedia } = useStorageApi();
const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();

// Reactive state
const fullGallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const gallery = ref<MediaGallery | null>(null);
const mediaItem = ref<MediaItem | null>(null);
const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});

const loadingGallery = ref(false);
const uploadingCrop = ref<CropName | null>(null);
const deletingCrop = ref<CropName | null>(null);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

// Helpers
function setFeedback(type: "ok" | "err", msg: string) {
  feedback.value = { type, msg };
  setTimeout(() => {
    feedback.value = null;
  }, 4000);
}

// Load gallery
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

    gallery.value = fullGallery.value;
    const items = fullGallery.value.items;
    if (!items.length) {
      mediaItem.value = null;
      existingCrops.value = {};
      return;
    }

    const item = items[0]!;
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

// Ensure gallery + item exist (lazy create)
async function ensureGalleryAndItem(): Promise<{
  gallery: MediaGallery;
  item: MediaItem;
}> {
  let gal = gallery.value;
  if (!gal) {
    const fresh = await getMediaGallery(props.blogId, locale.value);
    if (fresh) {
      gallery.value = fresh;
      gal = fresh;
    } else {
      const r = await createGallery({
        name: `blog-${props.blogId}-gallery`,
        type: "default",
      });
      if (!r.data) throw new Error(t("admin.blogs.image.galleryError"));
      gal = r.data as MediaGallery;
      gallery.value = gal;
      await linkMediaToBlog(props.blogId, gal.id);
    }
  }

  let item = mediaItem.value;
  if (!item) {
    const fresh = await getMediaGallery(props.blogId, locale.value);
    const fi = fresh?.items?.[0];
    if (fi) {
      item = {
        id: fi.id,
        type: fi.type,
        original_filename: fi.original_filename,
        position: fi.position,
        width: fi.width,
        height: fi.height,
        title: fi.title,
        description: fi.description,
        credits: fi.credits,
        created_at: fi.created_at,
        updated_at: fi.updated_at,
      } as MediaItem;
      mediaItem.value = item;
    } else {
      const r = await createItem({
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
      if (!r.data) throw new Error(t("admin.blogs.image.itemError"));
      item = r.data as MediaItem;
      mediaItem.value = item;
    }
  }
  return { gallery: gal, item };
}

// Upload a crop
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
    const path = `/photos/blog-${props.blogId}-${cropName}-${Date.now()}.${ext}`;

    const storeResp = await saveMedia(path, file);
    if (storeResp.error) throw new Error(storeResp.error);

    const cropResp = await createCrop({
      name: cropName as any,
      url: path,
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

// Delete a crop
async function handleDeleteCrop(cropName: CropName) {
  const crop = existingCrops.value[cropName];
  if (!crop) return;
  if (!confirm(t("admin.blogs.image.deleteConfirmCrop", { name: cropName })))
    return;

  deletingCrop.value = cropName;
  try {
    if (crop.url) await deleteMedia(crop.url);
    const m = { ...existingCrops.value };
    delete m[cropName];
    existingCrops.value = m;
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

function cropForSlot(cropName: CropName): MediaCrop | null {
  return existingCrops.value[cropName] ?? null;
}

const uploadedCount = computed(
  () => CROP_SLOTS.filter((s) => !!existingCrops.value[s.name]).length,
);
</script>

<template>
  <div class="space-y-4">
    <!-- Main card -->
    <div class="rounded-xl border border-card-border bg-card overflow-hidden">
      <!-- Header -->
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

        <!-- Circular progress -->
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
          <div
            v-for="slot in CROP_SLOTS"
            :key="slot.name"
            class="rounded-lg border overflow-hidden bg-background transition-colors"
            :class="
              existingCrops[slot.name as CropName]
                ? 'border-accent/40'
                : 'border-card-border'
            "
          >
            <!-- Preview area -->
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

              <!-- Spinner overlay -->
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
                class="absolute top-1.5 left-1.5 bg-accent/90 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded z-10 flex items-center gap-1"
              >
                <svg
                  class="w-2.5 h-2.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {{ t("admin.blogs.image.uploaded") }}
              </span>
            </div>

            <!-- Crop info + actions -->
            <div class="px-3 py-2.5 space-y-1.5">
              <div>
                <p
                  class="text-[11px] font-brand font-black uppercase tracking-widest text-foreground leading-tight"
                >
                  {{ t(slot.labelKey) }}
                </p>
                <p class="text-[9px] text-muted-foreground leading-snug mt-0.5">
                  {{ t(slot.hintKey) }}
                </p>
              </div>

              <div class="flex gap-2 pt-0.5">
                <!-- Upload / replace -->
                <button
                  :disabled="
                    uploadingCrop === slot.name || deletingCrop === slot.name
                  "
                  class="btn-outline flex-1 justify-center h-9 px-3 gap-1.5 text-[9px] disabled:opacity-40 disabled:cursor-not-allowed"
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

                <!-- Delete -->
                <button
                  v-if="existingCrops[slot.name as CropName]"
                  :disabled="
                    deletingCrop === slot.name || uploadingCrop === slot.name
                  "
                  class="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-action-red-border text-action-red-icon hover:bg-action-red-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

        <p class="text-[9px] text-muted-foreground text-center pt-4">
          {{ t("admin.blogs.image.allBelongNote") }}
        </p>
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

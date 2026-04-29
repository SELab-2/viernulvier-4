<script setup lang="ts">
/**
 * components/admin/blogs/ImageSection.vue
 *
 * Step 2 of the blog edit flow: media management.
 *
 * Concept:
 *   One blog has one MediaGallery of type "default".
 *   That gallery holds ONE MediaItem.
 *   That one item can have up to SIX named crops (different sizes / formats).
 *
 * UI sections:
 *   A) Item metadata — title (NL/EN), description (NL/EN), credits (NL/EN).
 *      Saved independently with its own button.
 *   B) Crop grid — 6 slots, each with upload / replace / delete.
 *      A circular progress indicator shows how many crops are uploaded.
 */
import type { MediaGallery, MediaItem, MediaCrop } from "@repo/common";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import type {
  GalleryWithItems,
  ItemViewWithCrops,
} from "~/utils/galleryFetcher";

// ── Crop slot definitions ────────────────────────────────────────────────────
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

// ── Props / emits ────────────────────────────────────────────────────────────
const props = defineProps<{ blogId: number }>();
const emit = defineEmits<{ (e: "crop-uploaded"): void }>();

// ── Composables ──────────────────────────────────────────────────────────────
const { t, locale } = useI18n();
const { create: createGallery } = useGalleryApi();
const { create: createItem, modify: modifyItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia, deleteMedia } = useStorageApi();
const { getMediaGallery, linkMedia: linkMediaToBlog } = useBlogApi();
const { getMainImageCrop } = useGallery();

// ── Reactive state ───────────────────────────────────────────────────────────
const fullGallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const gallery = ref<MediaGallery | null>(null);
const mediaItem = ref<MediaItem | null>(null);
const existingCrops = ref<Partial<Record<CropName, MediaCrop>>>({});

const loadingGallery = ref(false);
const uploadingCrop = ref<CropName | null>(null);
const deletingCrop = ref<CropName | null>(null);
const savingMeta = ref(false);
const feedback = ref<{ type: "ok" | "err"; msg: string } | null>(null);

// Item metadata form
const itemMeta = ref({
  title_nl: "",
  title_en: "",
  desc_nl: "",
  desc_en: "",
  cred_nl: "",
  cred_en: "",
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function setFeedback(type: "ok" | "err", msg: string) {
  feedback.value = { type, msg };
  setTimeout(() => {
    feedback.value = null;
  }, 4000);
}

// ── Load gallery ─────────────────────────────────────────────────────────────
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

    // Reconstruct MediaItem without the crops dictionary
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

    // Seed metadata form from existing item
    const ti = (item.title as any) ?? {};
    const de = (item.description as any) ?? {};
    const cr = (item.credits as any) ?? {};
    itemMeta.value = {
      title_nl: ti.nl ?? "",
      title_en: ti.en ?? "",
      desc_nl: de.nl ?? "",
      desc_en: de.en ?? "",
      cred_nl: cr.nl ?? "",
      cred_en: cr.en ?? "",
    };

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

// ── Ensure gallery + item exist (lazy create) ────────────────────────────────
async function ensureGalleryAndItem(): Promise<{
  gallery: MediaGallery;
  item: MediaItem;
}> {
  // 1 — Gallery
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

  // 2 — MediaItem
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
        title: {
          nl: itemMeta.value.title_nl,
          en: itemMeta.value.title_en || itemMeta.value.title_nl,
        },
        description: {
          nl: itemMeta.value.desc_nl,
          en: itemMeta.value.desc_en || itemMeta.value.desc_nl,
        },
        credits: {
          nl: itemMeta.value.cred_nl,
          en: itemMeta.value.cred_en || itemMeta.value.cred_nl,
        },
        gallery_ids: [gal.id],
      });
      if (!r.data) throw new Error(t("admin.blogs.image.itemError"));
      item = r.data as MediaItem;
      mediaItem.value = item;
    }
  }
  return { gallery: gal, item };
}

// ── Save item metadata ───────────────────────────────────────────────────────
async function saveItemMeta() {
  savingMeta.value = true;
  try {
    // If no item yet, ensure it is created with the current metadata
    if (!mediaItem.value) {
      await ensureGalleryAndItem();
      setFeedback("ok", t("admin.saved"));
      return;
    }
    const r = await modifyItem(mediaItem.value.id, {
      title: {
        nl: itemMeta.value.title_nl,
        en: itemMeta.value.title_en || itemMeta.value.title_nl,
      },
      description: {
        nl: itemMeta.value.desc_nl,
        en: itemMeta.value.desc_en || itemMeta.value.desc_nl,
      },
      credits: {
        nl: itemMeta.value.cred_nl,
        en: itemMeta.value.cred_en || itemMeta.value.cred_nl,
      },
    });
    if (!r.data) throw new Error("Save failed");
    mediaItem.value = r.data as MediaItem;
    setFeedback("ok", t("admin.saved"));
  } catch {
    setFeedback("err", t("admin.blogs.saveError"));
  } finally {
    savingMeta.value = false;
  }
}

// ── Upload a crop ────────────────────────────────────────────────────────────
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

// ── Delete a crop ────────────────────────────────────────────────────────────
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

// ── Shared input/label classes ───────────────────────────────────────────────
const inputCls = [
  "w-full px-4 bg-muted border border-border",
  "h-12",
  "font-bold uppercase text-[10px] tracking-widest rounded-lg",
  "outline-none transition-colors duration-150",
  "hover:border-foreground/20 hover:bg-muted/70",
  "focus:border-foreground/30 focus:bg-background",
  "placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90",
].join(" ");

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-1.5";
</script>

<template>
  <div class="space-y-5">
    <!-- ════════════════════════════════════════════════════════════════════
         Main card — one item, up to 6 crops
    ════════════════════════════════════════════════════════════════════ -->
    <div class="rounded-xl border border-card-border bg-card overflow-hidden">
      <!-- Header row -->
      <div
        class="px-5 py-4 border-b border-card-border bg-card-hover flex items-start justify-between gap-4"
      >
        <div>
          <!-- "1 item · N/6 crops" badge -->
          <div class="flex items-center gap-2 mb-1">
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest border border-accent/20"
            >
              <svg
                class="w-2.5 h-2.5 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" stroke-linecap="round" />
              </svg>
              1 item
            </span>
            <span
              class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground/70"
            >
              · {{ uploadedCount }} / {{ CROP_SLOTS.length }} crops
            </span>
          </div>

          <h2
            class="font-brand font-black text-[13px] uppercase tracking-widest text-card-foreground"
          >
            {{ t("admin.blogs.image.multiTitle") }}
          </h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ t("admin.blogs.image.multiSubtitle") }}
          </p>
        </div>

        <!-- Circular progress indicator -->
        <div class="shrink-0 relative w-11 h-11">
          <svg class="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
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
              ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400'
              : 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400',
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

      <div v-else class="p-5 space-y-6">
        <!-- ── Section A: Item metadata ─────────────────────────────────── -->
        <div class="rounded-xl border border-border overflow-hidden">
          <div
            class="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2"
          >
            <svg
              class="w-3 h-3 text-accent shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487z"
              />
            </svg>
            <div>
              <p
                class="text-[10px] font-brand font-black uppercase tracking-widest text-foreground"
              >
                Item metadata
              </p>
              <p class="text-[9px] text-muted-foreground">
                Titel, omschrijving en credits voor dit media-item
              </p>
            </div>
          </div>

          <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <!-- Title NL -->
            <div>
              <label :class="labelCls">Titel (NL)</label>
              <input
                v-model="itemMeta.title_nl"
                :class="inputCls"
                type="text"
                placeholder="Titel in het Nederlands"
              />
            </div>
            <!-- Title EN -->
            <div>
              <label :class="labelCls">Titel (EN)</label>
              <input
                v-model="itemMeta.title_en"
                :class="inputCls"
                type="text"
                placeholder="Title in English"
              />
            </div>
            <!-- Description NL -->
            <div>
              <label :class="labelCls">Omschrijving (NL)</label>
              <input
                v-model="itemMeta.desc_nl"
                :class="inputCls"
                type="text"
                placeholder="Omschrijving…"
              />
            </div>
            <!-- Description EN -->
            <div>
              <label :class="labelCls">Description (EN)</label>
              <input
                v-model="itemMeta.desc_en"
                :class="inputCls"
                type="text"
                placeholder="Description…"
              />
            </div>
            <!-- Credits NL -->
            <div>
              <label :class="labelCls">Credits (NL)</label>
              <input
                v-model="itemMeta.cred_nl"
                :class="inputCls"
                type="text"
                placeholder="Fotograaf, …"
              />
            </div>
            <!-- Credits EN -->
            <div>
              <label :class="labelCls">Credits (EN)</label>
              <input
                v-model="itemMeta.cred_en"
                :class="inputCls"
                type="text"
                placeholder="Photographer, …"
              />
            </div>
          </div>

          <!-- Save metadata button -->
          <div class="px-4 pb-4">
            <button
              type="button"
              :disabled="savingMeta"
              class="btn-outline h-12 px-6 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="saveItemMeta"
            >
              <svg
                v-if="savingMeta"
                class="w-3.5 h-3.5 animate-spin shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <svg
                v-else
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {{ savingMeta ? t("admin.saving") : t("admin.save") }}
            </button>
          </div>
        </div>

        <!-- ── Section B: Crop slots ─────────────────────────────────────── -->
        <div>
          <p
            class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"
          >
            <svg
              class="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" stroke-linecap="round" />
            </svg>
            6 formaten — allemaal voor dit ene item
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="slot in CROP_SLOTS"
              :key="slot.name"
              class="rounded-lg border overflow-hidden bg-background transition-colors"
              :class="
                existingCrops[slot.name as CropName]
                  ? 'border-accent/30'
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

                <!-- Spinner overlay while uploading / deleting -->
                <div
                  v-if="
                    uploadingCrop === slot.name || deletingCrop === slot.name
                  "
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

                <!-- "Uploaded" badge -->
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
                  <p
                    class="text-[9px] text-muted-foreground leading-snug mt-0.5"
                  >
                    {{ t(slot.hintKey) }}
                  </p>
                </div>

                <div class="flex gap-2 pt-0.5">
                  <!-- Upload / replace button -->
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

                  <!-- Delete button (only when crop exists) -->
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

          <p class="text-[9px] text-muted-foreground text-center pt-3">
            {{ t("admin.blogs.image.allBelongNote") }}
          </p>
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

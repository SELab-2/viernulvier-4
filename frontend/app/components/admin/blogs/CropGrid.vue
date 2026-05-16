<!--
  components/admin/blogs/CropGrid.vue
  ======================================
  Grid of crop slots for a single media item.

  Renders one CropSlot per entry in CROP_SLOTS, wires up the hidden file
  inputs (one per slot), and handles upload / delete interactions.

  This component was split out of ImageSection.vue to keep that file focused
  on gallery/item lifecycle (create, load, lazy-init) while this component
  focuses purely on the crop upload UX.

  Props:
  - blogId        — used to build storage paths and as the ID for MediaDisplay
  - existingCrops — map of cropName → MediaCrop for crops that already exist
  - loading       — when true the grid shows a skeleton instead of slots

  Emits:
  - upload(cropName, file)  — user picked a file for the given slot
  - delete(cropName)        — user confirmed deletion of the given crop
-->

<script setup lang="ts">
import type { MediaCrop } from "@repo/common";

// Crop slot definitions

/**
 * All six named crop slots with their i18n label + hint keys.
 * The `name` values match the CropName enum on the backend.
 */
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

// Props & emits

const props = defineProps<{
  /** Blog ID — used to build unique storage paths and as MediaDisplay id. */
  blogId: number;
  /** Map of already-uploaded crops, keyed by crop name. */
  existingCrops: Partial<Record<CropName, MediaCrop>>;
  /** Name of the crop currently being uploaded (null = none). */
  uploadingCrop: CropName | null;
  /** Name of the crop currently being deleted (null = none). */
  deletingCrop: CropName | null;
  /** When true show a loading skeleton rather than the crop grid. */
  loading: boolean;
}>();

const emit = defineEmits<{
  /** User picked a file for this slot. */
  (e: "upload", cropName: CropName, file: File): void;
  /** User confirmed deletion of this crop. */
  (e: "delete", cropName: CropName): void;
}>();

const { t } = useI18n();

// File input refs

/**
 * One hidden <input type="file"> per crop slot, keyed by crop name.
 * CropSlot triggers a click on the correct ref when the upload button is pressed.
 */
const fileInputs = ref<Partial<Record<CropName, HTMLInputElement | null>>>({});

/** Imperatively open the file-picker for the given slot. */
function triggerUpload(cropName: CropName) {
  fileInputs.value[cropName]?.click();
}

/**
 * Handle the browser's file-selection event.
 * Validates the file type and forwards valid images to the parent via `upload`.
 */
function handleFileChange(e: Event, cropName: CropName) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  // Reset so the user can pick the same file again if needed.
  input.value = "";

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    // We rely on the parent's feedback mechanism — emit nothing and let the
    // parent guard instead. You could also emit an 'error' event here.
    console.warn("[CropGrid] Non-image file selected:", file.type);
    return;
  }

  emit("upload", cropName, file);
}

// Derived helpers

/** Number of slots that have an uploaded crop — drives the progress ring. */
const uploadedCount = computed(
  () => CROP_SLOTS.filter((s) => !!props.existingCrops[s.name]).length,
);

/** Look up the MediaCrop for a given slot name (null if not yet uploaded). */
const cropForSlot = (name: CropName): MediaCrop | null =>
  props.existingCrops[name] ?? null;
</script>

<template>
  <!-- Loading skeleton: one placeholder per crop slot -->
  <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="i in CROP_SLOTS.length"
      :key="i"
      class="h-40 bg-muted rounded-lg animate-pulse"
    />
  </div>

  <!-- Crop grid -->
  <div v-else>
    <!-- Progress indicator row (shown above grid) -->
    <div class="flex items-center justify-between mb-4">
      <p
        class="text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ uploadedCount }}/{{ CROP_SLOTS.length }}
        {{ t("admin.blogs.image.uploaded") }}
      </p>

      <!-- Circular progress ring -->
      <div class="relative w-10 h-10">
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

    <!-- Crop slots grid -->
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
        @delete="emit('delete', slot.name as CropName)"
      >
        <!--
          Hidden file input injected into CropSlot's default slot.
          Using a ref-binding function keeps each input accessible by name.
        -->
        <input
          :ref="
            (el) => {
              fileInputs[slot.name as CropName] = el as HTMLInputElement | null;
            }
          "
          type="file"
          accept="image/*"
          class="hidden"
          @change="(e) => handleFileChange(e, slot.name as CropName)"
        />
      </AdminBlogsCropSlot>
    </div>

    <!-- Footer note -->
    <p class="text-[9px] text-muted-foreground text-center pt-4">
      {{ t("admin.blogs.image.allBelongNote") }}
    </p>
  </div>
</template>

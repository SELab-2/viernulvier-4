<!--
  components/admin/blogs/ImageSection.vue
  ==========================================
  Step 2 of the blog edit flow — manages the media gallery and image crops.

  Architecture:
  ┌─ ImageSection (this file) ─────────────────────────────────────────────┐
  │  Delegates all API logic to useImageSection (composable).              │
  │  Owns only the template wiring and slot composition.                   │
  │                                                                        │
  │  ┌── FormSectionsSectionCard ───────────────────────────────────────┐  │
  │  │  Card shell with accent bar + title + subtitle                   │  │
  │  │                                                                  │  │
  │  │  ┌── AdminBlogsImageFeedback ──────────────────────────────┐     │  │
  │  │  │  Transient success / error banner                       │     │  │
  │  │  └─────────────────────────────────────────────────────────┘     │  │
  │  │                                                                  │  │
  │  │  ┌── AdminBlogsCropGrid ────────────────────────────────────┐    │  │
  │  │  │  Six named crop slots, hidden file inputs, spinners      │    │  │
  │  │  └──────────────────────────────────────────────────────────┘    │  │
  │  └──────────────────────────────────────────────────────────────────┘  │
  │                                                                        │
  │  ┌── AdminBlogsItemMetadata ──────────────────────────────────────┐    │
  │  │  Title (NL/EN) + credits (NL/EN) form for the media item       │    │
  │  └────────────────────────────────────────────────────────────────┘    │
  └────────────────────────────────────────────────────────────────────────┘

  Data model:
  - One blog   →  one MediaGallery (type "default")
                      →  one MediaItem (position "main")
                              →  up to six named MediaCrops

  Props:
  - blogId  ID of the blog post whose images we are managing

  Emits:
  - crop-uploaded  fired after any successful upload or delete so the parent
                   edit page can refresh its hero-crop preview
-->

<script setup lang="ts">
import { useImageSection } from "~/composables/blogs/useImageSection";

const props = defineProps<{
  blogId: number;
}>();

const emit = defineEmits<{
  (e: "crop-uploaded"): void;
}>();

const { t } = useI18n();

// All API orchestration lives in the composable — this component only wires the template.
const {
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
  loadGalleryAndItem,
  handleUpload,
  handleDeleteCrop,
  saveMetadata,
} = useImageSection(props.blogId, () => emit("crop-uploaded"));

onMounted(loadGalleryAndItem);
</script>

<template>
  <div class="space-y-4">
    <!-- Crop grid card -->
    <FormSectionsSectionCard
      :title="t('admin.blogs.image.multiTitle')"
      :subtitle="t('admin.blogs.image.multiSubtitle')"
    >
      <!-- Feedback banner — auto-dismissed by the composable after four seconds -->
      <AdminBlogsImageFeedback :feedback="feedback" />

      <!-- Six named crop slots with upload/delete controls -->
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
    </FormSectionsSectionCard>

    <!--
      Metadata card — disabled until at least one crop has been uploaded
      (i.e. until a MediaItem exists to save the metadata against).
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

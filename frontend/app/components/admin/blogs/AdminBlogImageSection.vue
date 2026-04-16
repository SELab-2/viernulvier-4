<!--
  components/admin/AdminBlogImageSection.vue
  ============================================
  Manages the header image (FE3_header crop) for a given blog.

  Flow on upload:
  1.  Save file to storage  →  /photos/blogs/{blogId}/{timestamp}.{ext}
  2.  Get or create a "default" media gallery for this blog
  3.  Create a MediaItem  (linked to that gallery via gallery_ids)
  4.  Create a MediaCrop  (name: "FE3_header", linked to that item)
  5.  Re-fetch the gallery so the preview updates

  The component shows the current FE3_header crop if one exists,
  or a dashed placeholder when there is none yet.
-->
<script setup lang="ts">
import { ImageIcon, Upload } from "lucide-vue-next";
import { useBlogApi } from "~/composables/blogs/useBlogApi";
import { useGallery } from "~/composables/media/useGallery";
import { useGalleryApi } from "~/composables/media/useGalleryApi";
import { useItemApi } from "~/composables/media/useItemApi";
import { useCropApi } from "~/composables/media/useCropApi";
import { useStorageApi } from "~/composables/media/useStorageApi";

const props = defineProps<{ blogId: number }>();
const emit = defineEmits<{ (e: "updated"): void }>();

// --- Composables ---
const { getMediaGallery, linkMedia } = useBlogApi();
const { getMainImageCrop } = useGallery();
const { create: createGallery } = useGalleryApi();
const { create: createItem } = useItemApi();
const { create: createCrop } = useCropApi();
const { saveMedia } = useStorageApi();

// --- State ---
const gallery = ref<GalleryWithItems<ItemWithCrops> | null>(null);
const uploading = ref(false);
const errorMsg = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const headerCrop = computed(() =>
  gallery.value ? getMainImageCrop(gallery.value, "FE3_header") : null,
);

// --- Load ---
async function loadGallery() {
  gallery.value = await getMediaGallery(props.blogId);
}

// --- Upload ---
async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  uploading.value = true;
  errorMsg.value = null;

  try {
    // 1. Build a unique storage URL
    const ext = file.name.split(".").pop() ?? "jpg";
    const storageUrl = `/photos/blogs/${props.blogId}/${Date.now()}.${ext}`;

    // 2. Upload file to storage
    const saveResp = await saveMedia(storageUrl, file);
    if (!saveResp.data) throw new Error("Storage upload failed.");

    // 3. Get or create the default gallery
    let galleryId: number;
    if (gallery.value) {
      galleryId = gallery.value.id;
    } else {
      const galleryResp = await createGallery({
        name: `blog-${props.blogId}`,
        type: "default",
      });
      if (!galleryResp.data) throw new Error("Failed to create gallery.");
      galleryId = galleryResp.data.id;
      // Link gallery to blog
      await linkMedia(props.blogId, galleryId);
    }

    // 4. Create media item (linked to gallery via gallery_ids)
    const itemResp = await createItem({
      type: "image",
      original_filename: file.name,
      position: "main",
      width: 0,
      height: 0,
      title: { nl: file.name, en: file.name },
      description: { nl: "", en: "" },
      credits: { nl: "", en: "" },
      gallery_ids: [galleryId],
    });
    if (!itemResp.data) throw new Error("Failed to create media item.");

    // 5. Create the FE3_header crop linked to that item
    const cropResp = await createCrop({
      name: "FE3_header",
      url: saveResp.data as string,
      item_id: itemResp.data.id,
    });
    if (!cropResp.data) throw new Error("Failed to create media crop.");

    // 6. Re-load gallery to update preview
    await loadGallery();
    emit("updated");
  } catch (err) {
    console.error("[AdminBlogImageSection] Upload failed:", err);
    errorMsg.value =
      "Failed to upload the image. Check your connection and try again.";
  } finally {
    uploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

onMounted(loadGallery);
</script>

<template>
  <section class="bg-card border border-card-border rounded-xl p-6 space-y-4">
    <!-- Section heading -->
    <h2
      class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground pb-1 border-b border-border"
    >
      Header image
    </h2>

    <!-- Preview: existing crop -->
    <div
      v-if="headerCrop"
      class="relative w-full rounded-lg overflow-hidden"
      style="aspect-ratio: 16/5"
    >
      <MediaGalleryImage
        :object-id="blogId"
        :crop="headerCrop"
        size="fill"
        :rounded="false"
        :show-icon="false"
        class="absolute inset-0 w-full h-full object-cover"
      />
    </div>

    <!-- Placeholder: no image yet -->
    <div
      v-else
      class="flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-border bg-muted py-12"
    >
      <ImageIcon :size="32" class="text-muted-foreground/40 mb-2" />
      <p
        class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground/60"
      >
        No header image yet
      </p>
    </div>

    <!-- Error -->
    <p v-if="errorMsg" class="text-xs text-red-500 leading-relaxed">
      {{ errorMsg }}
    </p>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Upload button -->
    <button
      type="button"
      :disabled="uploading"
      class="btn-outline w-full justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      @click="fileInputRef?.click()"
    >
      <Upload :size="14" />
      <span v-if="uploading">Uploading…</span>
      <span v-else>{{ headerCrop ? "Replace image" : "Upload image" }}</span>
    </button>

    <p
      v-if="headerCrop"
      class="text-[10px] text-muted-foreground/60 text-center"
    >
      Uploading a new image adds it on top — it does not remove the old one.
    </p>
  </section>
</template>

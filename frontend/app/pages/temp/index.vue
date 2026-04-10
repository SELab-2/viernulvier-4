<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold mb-6">Component Playground</h1>

    <GalleryImage :item="mockItem" name="hd_ready" />

    <GalleryImage :item="mockItem" name="thumbnail" />
  </div>
</template>

<script setup lang="ts">
import GalleryImage from "~/components/GalleryImage.vue";
import type { ItemWithCrops } from "~/utils/galleryFetcher";

// Manually construct the perfectly typed object
const mockItem: ItemWithCrops = {
  id: 999,
  title: { en: "Test Image", nl: "HUH" },
  type: "image",
  original_filename: "test.jpg",
  position: "main",
  width: 1000,
  height: 1000,
  description: { en: "", nl: "" },
  credits: { en: "Test Image", nl: "HUH" },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  // Here is the magic: We provide 'hero', but we omit 'thumbnail'
  crops: {
    hd_ready: {
      id: 1,
      name: "hd_ready",
      url: "https://localhost:3000/media/photos/56631-FE3_2by1.jpg",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};
</script>

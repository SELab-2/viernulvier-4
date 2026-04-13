<template>
  <div class="p-10">
    <h1 class="text-2xl font-bold mb-6">Component Playground</h1>

    <div class="grid grid-cols-4 gap-4">
      <div v-for="(crop, index) in galleryImages" :key="index">
        <MediaGalleryImage :crop="crop" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { PaginatedResponse, ProductionView } from "@repo/common";
import { useGallery } from "~/composables/media/useGallery";

// Assuming you have this composable from our previous setup
const { getMainImageCrop } = useGallery();
const { getAll, getMediaGallery } = useProductionApi();

const productions = ref<ProductionView[]>([]);
const galleries = ref<(GalleryWithItems<ItemWithCrops> | null)[]>([]);
const totalItems = ref(0);
const isLoading = ref(false); // Good practice to add a loading state

// 1. Automatically extract the main crops whenever 'galleries' changes
const galleryImages = computed(() => {
  return galleries.value.map((gallery) => {
    const crop = getMainImageCrop(gallery, "hd_ready");
    return crop;
  }); // Replace 'default' with your preferred crop name
});

async function loadPage(page: number) {
  isLoading.value = true;
  try {
    const resp = await getAll({
      paginationFilters: {
        page: page - 1, // Fix: Use the passed argument, mapped to 0-based pagination
        limit: 20,
        descending: true,
      },
      languageFilters: { lang: "en" },
    });

    if (resp.data) {
      const data = resp.data as PaginatedResponse<ProductionView>;
      productions.value = data.objects;
      totalItems.value = data.totalItems;

      // 2. Load all galleries in parallel!
      await loadGalleriesForProductions(data.objects);
    }
  } catch (err) {
    console.error("Failed to load page:", err);
  } finally {
    isLoading.value = false;
  }
}

async function loadGalleriesForProductions(prods: ProductionView[]) {
  // Create an array of Promises that will fetch concurrently
  const galleryPromises = prods.map(async (production) => {
    const fullGallery = await getMediaGallery(production.id);
    return fullGallery;
  });

  // Wait for ALL promises to finish simultaneously
  const resolvedGalleries = await Promise.all(galleryPromises);
  galleries.value = resolvedGalleries;
}

// Top-level await is perfectly fine in Nuxt <script setup>
await loadPage(1);
</script>

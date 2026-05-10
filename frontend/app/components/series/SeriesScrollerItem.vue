<!--
  A single scroller item for SeriesScroller:
  - Displays a production's thumbnail and title, clickable to the production detail page.
  - ThumbnailPlaceholder if production has no image.

  Usage:
  <SeriesScrollerItem
    :production="production"
  />
-->

<script setup lang="ts">
import type { ProductionView } from "@repo/common";
import { useProductionApi } from "~/composables/useProductionApi";
import { useGallery } from "~/composables/media/useGallery";
import { ROUTES } from "~/utils/routes";

const { production } = defineProps<{
  production: ProductionView;
}>();

const { getMediaGallery } = useProductionApi();
const { getMainImageCrop } = useGallery();
const { locale } = useI18n();

const gallery = ref<GalleryWithItems<ItemViewWithCrops> | null>(null);
const mainCrop = computed(() => {
  if (!gallery.value) return null;
  return getMainImageCrop(gallery.value, "hd_ready");
});

onMounted(async () => {
  gallery.value = await getMediaGallery(production.id, locale.value);
});
</script>

<template>
  <NuxtLink
    :to="ROUTES.productions.byId(production.id)"
    class="group block w-48"
  >
    <!-- Thumbnail -->
    <div
      class="w-32 sm:w-48 shrink-0 relative overflow-hidden rounded-lg mb-3"
      style="min-height: 84px"
    >
      <MediaDisplay
        :id="production.id"
        :src="mainCrop"
        :show-icon="true"
        :rounded="true"
      />
    </div>

    <!-- Title -->
    <span
      class="text-[13px] font-medium leading-tight line-clamp-2 text-card-foreground"
    >
      {{ production.titel }}
    </span>
  </NuxtLink>
</template>

<style scoped></style>

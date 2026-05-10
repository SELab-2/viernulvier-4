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
      class="mb-2 rounded-lg overflow-hidden border border-card-border group-hover:border-ring transition-colors"
    >
      <MediaDisplay
        :id="production.id"
        :src="mainCrop"
        :show-icon="true"
        size="md"
        class="w-full h-full"
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

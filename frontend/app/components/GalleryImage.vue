<template>
  <img
    v-if="crop && !hasError"
    :src="crop.url"
    loading="lazy"
    @error="handleImageError"
  />
  <ThumbnailPlaceholder
    v-else
    size="lg"
    :showIcon="true"
    :showBorder="false"
    :rounded="false"
    class="w-full h-full"
  />
</template>
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";

const props = defineProps<{
  crop: MediaCrop | null;
}>();

const hasError = ref(false);
const handleImageError = () => {
  hasError.value = true;
};

watch(
  () => props.crop?.url,
  () => {
    hasError.value = false;
  },
);
</script>

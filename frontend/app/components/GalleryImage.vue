<template>
  <img
    v-if="crop && !hasError"
    :src="formattedUrl"
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
import { formatUrl } from "#imports";

const props = defineProps<{
  crop: MediaCrop | null;
}>();

const hasError = ref(false);
const handleImageError = () => {
  hasError.value = true;
};

const formattedUrl = computed(() => {
  if (!props.crop) return undefined;

  const url = formatUrl(props.crop.url);

  console.log(url);

  return url;
});

watch(
  () => props.crop?.url,
  () => {
    hasError.value = false;
  },
);
</script>

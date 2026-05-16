<!--
  media/GalleryImage.vue -> MediaDisplay component

  This component allows us to display and style an image or a placeholder any way we want.
  You can pass the crop that you want to display (or null) and the component
  will automatically show a placeholder when the image is unable to be loaded
  for any reason.
  There are also some style options for the placeholder that can be adjusted. 
-->

<template>
  <PdfThumbnail
    v-if="isPdf && src && !hasError"
    :src="src.url"
    @error="handleImageError"
    :class="containerClass"
  />
  <img
    v-else-if="src && !hasError"
    :src="formattedUrl"
    loading="lazy"
    @error="handleImageError"
    :class="[
      containerClass,
      props.objectFit ? `object-${props.objectFit}` : '',
    ]"
  />
  <ThumbnailPlaceholder
    v-else
    :id="id"
    :size="size"
    :showIcon="showIcon"
    :showBorder="showBorder"
    :rounded="rounded"
  />
</template>
<script setup lang="ts">
import type { MediaCrop, PrintItem, PrintItemView } from "@repo/common";
import { formatUrl } from "#imports";

const props = defineProps<{
  id?: number;
  src: MediaCrop | PrintItem | PrintItemView | null;
  size?: "sm" | "md" | "lg" | "fill" | number;
  objectFit?: "contain" | "cover" | "fill" | "scale-down";
  showIcon?: boolean;
  showBorder?: boolean;
  rounded?: boolean;
}>();

const hasError = ref(false);
const handleImageError = () => {
  hasError.value = true;
};

const containerClass = computed(() => {
  const rounded = props.rounded !== false; // default true

  const parts = ["overflow-hidden flex items-center justify-center"];
  if (rounded) parts.push("rounded-lg");

  if (props.size === "fill") parts.push("w-full h-full");
  else if (props.size === "sm") parts.push("w-32 h-20");
  else if (props.size === "lg") parts.push("w-72 h-48");
  else parts.push("w-48 h-32");

  return parts.join(" ");
});

const formattedUrl = computed(() => {
  if (!props.src) return undefined;

  const url = props.src.url;

  // This is necessary to handle the already formatted media from admin production form in the preview.
  if (url.startsWith("blob:")) {
    return url;
  }

  return formatUrl(url);
});

const isPdf = computed(() => {
  return props.src?.url?.toLowerCase().endsWith(".pdf");
});

watch(
  () => props.src?.url,
  () => {
    hasError.value = false;
  },
);
</script>

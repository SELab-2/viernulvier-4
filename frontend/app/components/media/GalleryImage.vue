<template>
  <img
    v-if="crop && !hasError"
    :src="formattedUrl"
    loading="lazy"
    @error="handleImageError"
    :class="containerClass"
  />
  <ThumbnailPlaceholder
    v-else
    :size="size"
    :showIcon="showIcon"
    :showBorder="showBorder"
    :rounded="rounded"
  />
</template>
<script setup lang="ts">
import type { MediaCrop } from "@repo/common";
import { formatUrl } from "#imports";

const props = defineProps<{
  crop: MediaCrop | null;
  size?: "sm" | "md" | "lg" | "fill" | number;
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

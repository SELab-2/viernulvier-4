<template>
  <img v-if="crop" :src="crop.url" loading="lazy" />
  <div v-else>
    <ThumbnailPlaceholder />
  </div>
</template>
<script setup lang="ts">
import type { CropName } from "@repo/common";
import { computed } from "vue";
import type { ItemWithCrops } from "~/utils/galleryFetcher";

const props = defineProps<{
  item: ItemWithCrops;
  name: CropName;
}>();

const crop = computed(() => props.item.crops[props.name]);
</script>

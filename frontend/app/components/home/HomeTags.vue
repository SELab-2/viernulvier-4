<!-- components/home/HomeTags.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router";
import type { TagView } from "@repo/common";

// 1. Accept tags from the parent to ensure both strips are identical
defineProps<{
  tags: TagView[];
}>();

const router = useRouter();
// Assuming useArchiveView is an auto-imported composable in your Nuxt/Vue project
const { tagIds } = useArchiveView();

// Route to the archive page with the tag ID in the query string
function goToTag(tagId: number) {
  tagIds.value = [tagId];
  router.push({ path: "/productions" });
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2.5">
      <TagPill
        v-for="tag in tags"
        :key="tag.id"
        :label="tag.tag"
        clickable
        @click="goToTag(tag.id)"
      />
    </div>
  </div>
</template>

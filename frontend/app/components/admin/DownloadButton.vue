<script setup lang="ts">
/**
 * Reusable download action button.
 * Wraps ActionButton with a blue style and download icon.
 */
import {Download} from "lucide-vue-next";

interface Props {
  label: string;
  src: string;
  name?: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
});

const downloadFile = async () => {
  const a = document.createElement('a') // creates a temporary html <a> element
  a.href = props.src
  a.download = props.name ?? ""
  a.click()
}
</script>

<template>
  <!-- Blue download action button -->
  <AdminActionButton
      :label="label"
      :size="props.size"
      variant="blue"
      @click="downloadFile"
  >
    <!-- Download icon inherits the computed size from ActionButton -->
    <template #default="{ iconSize }">
      <Download :size="iconSize" />
    </template>
  </AdminActionButton>
</template>

<style scoped>

</style>
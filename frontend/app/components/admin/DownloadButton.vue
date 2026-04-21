<script setup lang="ts">
/**
 * Reusable download action button.
 * Wraps ActionButton with a green style and download icon.
 */
import { Download } from "lucide-vue-next";

interface Props {
  label: string;
  src: string;
  name?: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
});

// note: credentials: "same-origin" is just to be able to use mock data hosted on third-party sites (with permissive CORS)
// normally prints should be from our own database, feel free to remove isOwnBackend and set credentials to "include", if
// your prefer to not have the feature above
const downloadFile = async () => {
  const isOwnBackend =
    props.src.startsWith("/") ||
    new URL(props.src).hostname === window.location.hostname;

  const response = await fetch(props.src, {
    credentials: isOwnBackend ? "include" : "same-origin",
  });

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob); // temporary URL, lives in browser's memory

  const a = document.createElement("a"); // creates a temporary html <a> element
  a.href = blobUrl;
  a.download = props.name ?? props.src.split("/").pop() ?? "download";
  a.click();

  setTimeout(() => URL.revokeObjectURL(blobUrl), 100); // cleaning up temporary URL
};
</script>

<template>
  <!-- Green download action button -->
  <AdminActionButton
    :label="label"
    :size="props.size"
    variant="green"
    @click="downloadFile"
  >
    <!-- Download icon inherits the computed size from ActionButton -->
    <template #default="{ iconSize }">
      <Download :size="iconSize" />
    </template>
  </AdminActionButton>
</template>

<style scoped></style>

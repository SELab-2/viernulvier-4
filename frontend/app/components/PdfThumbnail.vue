<script setup lang="ts">
/**
 * Renders a single PDF's first page as a thumbnail preview, includes:
 *  - Renders first page of a PDF onto a <canvas> element using PDF.js
 *  - Scales to fit the thumbnail at (at least) 2x resolution for sharpness
 *  - Loading spinner while the PDF is being fetched and rendered
 *  - Opens the full PDF in a new tab when clicked
 *  - Falls back to a placeholder via the #fallback slot on error
 *
 * Usage:
 * <PrintsPdfThumbnail :src="file.image">
 *   <template #fallback>
 *     <ThumbnailPlaceholder ... />
 *   </template>
 * </PrintsPdfThumbnail>
 */

// With this import we don't rely on external delivery networks.
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
const emit = defineEmits(["error"]);

interface Props {
  src: string;
}
const props = defineProps<Props>();

const canvas = ref<HTMLCanvasElement | null>(null);
const loading = ref(true); // PDF is loading
const error = ref(false); // something went wrong

onMounted(async () => {
  try {
    const pdf = await pdfjsLib.getDocument(props.src).promise;
    const page = await pdf.getPage(1); // first page of PDF to display

    const dpr = Math.max(window.devicePixelRatio || 1, 2); // ensures at least 2x res on every screen, (or else it looks crispy)
    const desiredWidth = (canvas.value!.offsetWidth || 300) * dpr; // canvas's actual rendered width, fallback to 300px
    const viewport = page.getViewport({ scale: 1 }); // page dimensions at scale 1 (original size)
    const scale = desiredWidth / viewport.width; // scale needed to fit the page into the canvas width
    const scaledViewport = page.getViewport({ scale }); // viewport with correct scale

    canvas.value!.width = scaledViewport.width;
    canvas.value!.height = scaledViewport.height;

    const renderTask = page.render({
      canvasContext: canvas.value!.getContext("2d")!,
      viewport: scaledViewport,
    });
    await renderTask.promise;

    loading.value = false; // hide loading state when done
  } catch (e) {
    loading.value = false; // failure
    error.value = true;
    emit("error");
  }
});

const openPdf = () => props.src && window.open(props.src, "_blank"); // for opening the PDF in a new browser tab
</script>

<template>
  <div class="absolute inset-0 w-full h-full" @click.stop="openPdf">
    <div
      v-if="loading"
      class="w-full h-full flex items-center justify-center bg-muted"
    >
      <div
        class="w-6 h-6 rounded-full border-2 border-border border-t-foreground animate-spin"
      />
    </div>
    <!-- Preview -->
    <canvas
      v-show="!loading && !error"
      ref="canvas"
      class="w-full h-full object-cover"
    />
    <!-- Error fallback -->
    <slot v-if="error" name="fallback" />
    <!-- renders what the parent passes here when error -->
  </div>
</template>

<style scoped></style>

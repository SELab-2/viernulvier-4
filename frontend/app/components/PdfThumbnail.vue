<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

interface Props {
  src: string
}
const props = defineProps<Props>()

const canvas = ref<HTMLCanvasElement | null>(null)
const loading = ref(true) // PDF is loading
const error = ref(false) // something went wrong

onMounted(async () => {
  try {
    const pdf = await pdfjsLib.getDocument(props.src).promise
    const page = await pdf.getPage(1) // first page of PDF to display

    const dpr = Math.max(window.devicePixelRatio || 1, 2) // ensures at least 2x res on every screen, (or else it looks crispy)
    const desiredWidth = (canvas.value!.offsetWidth || 300) * dpr // canvas's actual rendered width, fallback to 300px
    const viewport = page.getViewport({ scale: 1 }) // page dimensions at scale 1 (original size)
    const scale = desiredWidth / viewport.width // scale needed to fit the page into the canvas width
    const scaledViewport = page.getViewport({ scale }) // viewport with correct scale

    canvas.value!.width = scaledViewport.width
    canvas.value!.height = scaledViewport.height

    const renderTask = page.render({
      canvasContext: canvas.value!.getContext('2d')!,
      viewport: scaledViewport,
      canvas: canvas.value!, // the canvas element itself
    })
    await renderTask.promise

    loading.value = false // hide loading state when done
  } catch (e) {
    loading.value = false // failure
    error.value = true
  }
})

const openPdf = () => window.open(props.src, '_blank') // for opening the PDF in a new browser tab
</script>

<template>
  <div class="absolute inset-0 w-full h-full" @click.stop="openPdf">
    <!-- Loading -->
    <div v-if="loading" class="w-full h-full animate-pulse bg-muted" />
    <!-- Preview -->
    <canvas
        v-show="!loading && !error"
        ref="canvas"
        class="w-full h-full object-cover"
    />
    <!-- Error fallback -->
    <slot v-if="error" name="fallback" /> <!-- renders what the parent passes here when error -->
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ProductionView, Tag } from '@repo/common'
import { useProductionApi } from '../composables/useProductionApi'

const { productionView } = defineProps<{
  productionView: ProductionView
}>()

const tags = ref<Tag[]>([])
const { getTags } = useProductionApi()

function formatText(text: string | null) {
  if (!text) return ''
  return text.replace(/\\+/g, '<br>')
}

onMounted(async () => {
  if (productionView && productionView.id) {
    const response = await getTags(productionView.id, 'nl')
    if (response.data) {
      tags.value = response.data as Tag[]
    } else {
      console.error('Failed to load tags:', response.error)
    }
  }
})
</script>

<template>
  <div class="group flex items-center gap-4 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-200 cursor-pointer">

    <!-- Thumbnail placeholder -->
    <div class="shrink-0 w-14 h-14 rounded-lg bg-zinc-100 flex items-center justify-center">
      <svg class="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6ZM3.75 15.75l4.5-4.5 4.5 4.5 3-3 3 3" />
      </svg>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0 self-center">

      <!-- Title -->
      <p
        class="text-sm font-semibold text-zinc-800 leading-snug truncate"
        v-html="formatText(productionView.titel)"
      />

      <!-- Tags -->
      <div v-if="tags.length" class="mt-2 flex flex-wrap gap-1.5">
        <span
          v-for="tag in tags"
          :key="tag.id"
          class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors duration-150"
        >
          {{ tag.tag }}
        </span>
      </div>

    </div>

    <!-- Chevron -->
    <div class="shrink-0 self-center text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all duration-200">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>

  </div>
</template>

<style scoped>
</style>
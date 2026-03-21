<script setup lang="ts">
import { computed } from 'vue'
import { pickPlaceholderGradient } from '../utils/constants'

const props = defineProps<{
  id?: number,
  size?: 'sm' | 'md' | 'lg' | number,
  showIcon?: boolean
}>()

const gradient = computed(() => pickPlaceholderGradient(props.id))
const containerClass = computed(() => {
  const base = 'rounded-lg overflow-hidden flex items-center justify-center border border-zinc-300'
  if (props.size === 'sm') return `${base} w-32 h-20`
  if (props.size === 'lg') return `${base} w-72 h-48`
  return `${base} w-48 h-32`
})
</script>

<!-- ThumbnailPlaceholder: reusable gradient-based thumbnail placeholder component. -->

<template>
  <div :class="containerClass" :style="{ background: gradient }">
    <div class="w-full h-full flex items-center justify-center text-white">
      <svg v-if="props.showIcon !== false" class="w-12 h-12 opacity-90" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 15l4-4 6 6 4-5 4 5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
</style>

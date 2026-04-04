<!--
  A placeholder component for thumbnails with a gradient background and an optional icon.

  Props:
    - id: An optional identifier used to pick a consistent gradient.
    - size: The size of the placeholder, can be 'sm', 'md', 'lg', or a custom number.
    - showIcon: A boolean to determine whether to show the thumbnail icon.
    - showBorder: Whether to show the border. Defaults to true.
    - rounded: Whether to apply rounded corners. Defaults to true.
-->

<script setup lang="ts">
import { computed } from 'vue'
import { pickPlaceholderGradient } from '../utils/constants'

const props = defineProps<{
  id?: number,
  size?: 'sm' | 'md' | 'lg' | 'fill' | number,
  showIcon?: boolean,
  showBorder?: boolean,
  rounded?: boolean,
}>()

const gradient = computed(() => pickPlaceholderGradient(props.id))

const containerClass = computed(() => {
  const showBorder = props.showBorder !== false  // default true
  const rounded = props.rounded !== false         // default true

  const parts = ['overflow-hidden flex items-center justify-center']
  if (rounded) parts.push('rounded-lg')
  if (showBorder) parts.push('border border-card-border')

  if (props.size === 'fill') parts.push('w-full h-full')
  else if (props.size === 'sm') parts.push('w-32 h-20')
  else if (props.size === 'lg') parts.push('w-72 h-48')
  else parts.push('w-48 h-32')

  return parts.join(' ')
})
</script>

<template>
  <div :class="containerClass" class="bg-thumbnail-bg">
    <div class="w-full h-full flex items-center justify-center" :style="{ background: gradient }">
      <svg v-if="props.showIcon !== false" class="w-12 h-12 text-thumbnail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M3 15l4-4 6 6 4-5 4 5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
</style>
<script setup lang="ts">
// TagPill: small presentational tag label component.
const props = defineProps<{
  label: string,
  compact?: boolean
}>()
</script>

<template>
  <span :class="['inline-flex items-center rounded-full text-sm font-medium', compact ? 'px-2 py-0.5' : 'px-3 py-0.5']" style="background: rgba(130,36,227,0.08); color: var(--accent);">
    {{ label }}
  </span>
</template>

<style scoped>
</style>

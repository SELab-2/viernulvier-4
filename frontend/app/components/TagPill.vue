<!--
  A simple component to display a tag as a pill-shaped label.
  It accepts a `label` prop for the text to display and an optional `compact` prop to adjust the padding for a more compact appearance.
-->
<script setup lang="ts">
// TagPill: small presentational tag label component.
const props = defineProps<{
  label: string,
  compact?: boolean
}>()
</script>

<template>
  <span
    :class="['inline-flex items-center rounded-full text-sm font-medium', compact ? 'px-2 py-0.5' : 'px-3 py-0.5']"
    class="text-accent bg-accent/10"
  >
    {{ label }}
  </span>
</template>

<style scoped>
</style>
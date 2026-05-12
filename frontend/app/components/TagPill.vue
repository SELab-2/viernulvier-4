<script setup lang="ts">
// Takes a label to show, whether to do it compactly and whether to make it clickable.
defineProps<{
  label: string;
  compact?: boolean;
  clickable?: boolean;
}>();
</script>

<template>
  <component
    :is="clickable ? 'button' : 'span'"
    class="tag-pill inline-flex items-center justify-center rounded-full border transition-all outline-none flex-shrink-0 whitespace-nowrap font-brand font-black uppercase tracking-widest"
    :class="[
      compact ? 'h-6 px-3 text-[8px]' : 'h-8 px-4 text-[9px]',
      clickable
        ? 'border-border/50 bg-muted/20 text-foreground cursor-pointer hover:border-accent hover:bg-accent/10 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50'
        : 'border-transparent bg-accent/10 text-accent',
    ]"
  >
    {{ label }}
  </component>
</template>

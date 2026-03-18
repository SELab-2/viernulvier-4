<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

defineProps<{
  to: string
  image: string
  imageAlt: string
  title: string
  body: string
  cta: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="group relative overflow-hidden block" style="height: 460px;">
    <img
      :src="image"
      :alt="imageAlt"
      class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
    <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />

    <!-- Top accent line slides in on hover -->
    <div class="absolute top-0 left-0 right-0 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

    <div class="relative h-full flex flex-col justify-end p-8 md:p-10">
      <h3 class="text-2xl md:text-3xl font-display font-black text-white mb-3 leading-tight">
        {{ title }}
      </h3>
      <p class="text-sm text-white/70 leading-relaxed mb-6 max-w-sm">
        {{ body }}
      </p>
      <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
        {{ cta }}
        <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.font-display {
  font-family: 'Georgia', 'Times New Roman', serif;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
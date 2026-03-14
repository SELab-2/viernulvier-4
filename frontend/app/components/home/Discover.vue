<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

const { t } = useI18n()
</script>

<template>
  <section class="py-24">
    <div class="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-display font-black mb-12">
        {{ t('discover.title') }}
      </h2>

      <!-- Two cards side by side, constrained to max-w-7xl like all other sections.
           Gap makes them feel like distinct clickable elements rather than a single image strip. -->
      <div class="grid md:grid-cols-2 gap-4 md:gap-6">

        <!-- Stories & History card -->
        <NuxtLink to="/blogs" class="group relative overflow-hidden block" style="height: 460px;">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80"
            alt="Stories and History"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
          <!-- Top accent line slides in on hover -->
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div class="relative h-full flex flex-col justify-end p-8 md:p-10">
            <h3 class="text-2xl md:text-3xl font-display font-black text-white mb-3 leading-tight">
              {{ t('discover.stories.title') }}
            </h3>
            <p class="text-sm text-white/70 leading-relaxed mb-6 max-w-sm">
              {{ t('discover.stories.body') }}
            </p>
            <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
              {{ t('discover.stories.cta') }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>

        <!-- Posters & Printed Materials card -->
        <NuxtLink to="/uploads" class="group relative overflow-hidden block" style="height: 460px;">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80"
            alt="Posters and Printed Materials"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
          <div class="absolute top-0 left-0 right-0 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <div class="relative h-full flex flex-col justify-end p-8 md:p-10">
            <h3 class="text-2xl md:text-3xl font-display font-black text-white mb-3 leading-tight">
              {{ t('discover.posters.title') }}
            </h3>
            <p class="text-sm text-white/70 leading-relaxed mb-6 max-w-sm">
              {{ t('discover.posters.body') }}
            </p>
            <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
              {{ t('discover.posters.cta') }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>

      </div>
    </div>
  </section>
</template>

<style scoped>
.font-display {
  font-family: 'Georgia', 'Times New Roman', serif;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>
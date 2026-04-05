<!--
  HomeHero.vue

  Implements the full-screen hero section at the top of the home page.

  Key features:
  - Full-viewport-height section (85vh, min 560px) with a slowly zooming
    background image (slow-zoom keyframe animation on .hero-img)
  - Gradient overlay fading from transparent at the top to solid black
    at the bottom, making the title readable against any image
  - VIERNULVIER brand title + locale-aware "Archief"/"Archive" subtitle
    anchored to the bottom of the section
  - Subtitle and CTA button text sourced from i18n keys (hero.*)
  - CTA button links to the archive page
-->
<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { ROUTES } from '~/utils/routes'

const { t } = useI18n()

</script>

<template>
  <section class="relative h-[85vh] min-h-[560px] overflow-hidden bg-black">
    <!-- Background image with slow zoom animation -->
    <img
      src="https://images.unsplash.com/photo-1765278624799-9c90305b0b7e?w=1400&q=80"
      alt="VIERNULVIER performance"
      class="absolute inset-0 w-full h-full object-cover opacity-50 hero-img"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

    <!-- Hero content anchored to the bottom of the section -->
    <div class="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 max-w-7xl mx-auto w-full">
      <!-- Title: VIERNULVIER bold + Archive/Archief light underneath -->
      <div class="mb-8">
        <h1 class="hero-title font-display font-black text-white uppercase leading-none tracking-tight">
          VIERNULVIER
        </h1>
        <p class="hero-archief font-display font-light text-white/90 leading-none tracking-tight">
          {{ t('hero.title') }}
        </p>
      </div>

      <p class="text-lg md:text-xl text-white/70 mb-10 leading-relaxed whitespace-nowrap">
        {{ t('hero.subtitle') }}
      </p>

      <NuxtLink :to="ROUTES.archive.base">
        <button class="group inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 font-bold text-sm tracking-wide hover:bg-white/90 transition-colors">
          {{ t('hero.cta') }}
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

/* Fluid title sizing: scales between 3.5rem and 8rem based on viewport width */
.hero-title {
  font-size: clamp(3.5rem, 10vw, 8rem);
  letter-spacing: -0.02em;
}

/* Fluid subtitle sizing: sits directly below the main title */
.hero-archief {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  font-weight: 400;
  margin-top: -0.05em;
}

/* Slow continuous zoom on the background image for a cinematic effect */
@keyframes slow-zoom {
  from { transform: scale(1.02); }
  to   { transform: scale(1.08); }
}

.hero-img {
  animation: slow-zoom 14s ease-in-out infinite alternate;
}
</style>
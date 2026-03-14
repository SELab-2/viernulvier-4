<script setup lang="ts">
import { ArrowRight, Sun, Moon } from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()

//TODO Dark mode toggle — will be moved to the global header later
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')
</script>

<template>
  <section class="relative h-[85vh] min-h-[560px] overflow-hidden bg-black">
    <!-- Background image with zoom -->
    <img
      src="https://images.unsplash.com/photo-1765278624799-9c90305b0b7e?w=1400&q=80"
      alt="VIERNULVIER performance"
      class="absolute inset-0 w-full h-full object-cover opacity-50 hero-img"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

    <!-- Controls: dark mode + language toggle (will move to header later) -->
    <div class="absolute top-6 right-6 z-30 flex items-center gap-2">
      <button
        @click="toggleDark"
        class="p-2 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>
      <button
        @click="toggleLocale"
        class="px-3 py-1.5 border border-white/30 text-sm text-white font-mono hover:bg-white hover:text-black transition-all duration-200 tracking-widest"
      >
        {{ locale.toUpperCase() }}
      </button>
    </div>

    <!-- Hero content anchored to bottom -->
    <div class="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 max-w-7xl mx-auto w-full">
      <!-- Title: VIERNULVIER bold + Archive/Archief light underneath -->
      <div class="mb-8">
        <h1 class="hero-title font-display font-black text-white uppercase leading-none tracking-tight">
          VIERNULVIER
        </h1>
        <p class="hero-archief font-display font-light text-white/90 leading-none tracking-tight">
          {{ locale === 'nl' ? 'Archief' : 'Archive' }}
        </p>
      </div>

      <p class="text-lg md:text-xl text-white/70 mb-10 leading-relaxed whitespace-nowrap">
        {{ t('hero.subtitle') }}
      </p>

      <NuxtLink to="/archive">
        <button class="group inline-flex items-center gap-3 bg-white text-black px-7 py-3.5 font-bold text-sm tracking-wide hover:bg-white/90 transition-colors">
          {{ t('hero.cta') }}
          <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </NuxtLink>
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

.hero-title {
  font-size: clamp(3.5rem, 10vw, 8rem);
}

.hero-archief {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  margin-top: -0.05em;
}

@keyframes slow-zoom {
  from { transform: scale(1.02); }
  to   { transform: scale(1.08); }
}

.hero-img {
  animation: slow-zoom 14s ease-in-out infinite alternate;
}
</style>
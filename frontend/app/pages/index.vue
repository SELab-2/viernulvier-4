<script setup lang="ts">
import { ArrowRight, Calendar, Sun, Moon } from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()

// Dark mode
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')

// TODO: replace with real API data
const highlights = [
  {
    id: 1,
    title: 'Viernulvier Performance',
    artist: 'Ghent Collective',
    dates: ['2024-03-10'],
    category: 'Theater',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80',
  },
  {
    id: 2,
    title: 'Electronic Night',
    artist: 'Soundscape',
    dates: ['2024-04-15'],
    category: 'Muziek',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80',
  },
  {
    id: 3,
    title: 'Modern Dance Expo',
    artist: 'Movements',
    dates: ['2024-05-20'],
    category: 'Dans',
    image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=600&q=80',
  },
  {
    id: 4,
    title: 'Archief Sessie #4',
    artist: 'History Makers',
    dates: ['2024-02-01'],
    category: 'Expo',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80',
  },
  {
    id: 5,
    title: 'Urban Art Festival',
    artist: 'Street Crew',
    dates: ['2024-06-12'],
    category: 'Performance',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=80',
  },
  {
    id: 6,
    title: 'Jazz in Gent',
    artist: 'Blue Note Trio',
    dates: ['2024-01-25'],
    category: 'Muziek',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80',
  },
]

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'nl' ? 'nl-BE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased">

    <!-- ═══════════════════════ HERO ═══════════════════════ -->
    <section class="relative h-[85vh] min-h-[560px] overflow-hidden bg-black">
      <img
        src="https://images.unsplash.com/photo-1765278624799-9c90305b0b7e?w=1400&q=80"
        alt="VIERNULVIER performance"
        class="absolute inset-0 w-full h-full object-cover opacity-50 hero-img"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <!-- Controls: dark mode + language (will move to header later) -->
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

      <div class="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 max-w-7xl mx-auto w-full">
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

    <!-- ═══════════════════════ ARCHIVE HIGHLIGHTS ═══════════════════════ -->
    <section class="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-black/10 dark:border-white/10 pb-6">
        <h2 class="text-3xl md:text-4xl font-display font-black tracking-tight">
          {{ t('highlights.title') }}
        </h2>
        <p class="text-base text-black/70 dark:text-white/70 max-w-xs text-right hidden sm:block">
          {{ t('highlights.subtitle') }}
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14">
        <NuxtLink
          v-for="item in highlights"
          :key="item.id"
          :to="`/production/${item.id}`"
          class="group block"
        >
          <div class="relative overflow-hidden aspect-[4/3] bg-black/5 dark:bg-white/5 mb-4">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-mono">
              <Calendar class="w-3 h-3 shrink-0" />
              <span>{{ formatDate(item.dates[0]) }}</span>
            </div>
            <div class="absolute top-3 right-3 px-2 py-0.5 bg-white dark:bg-black text-black dark:text-white text-[10px] font-mono font-bold uppercase tracking-widest">
              {{ item.category }}
            </div>
          </div>
          <h3 class="font-display font-bold text-lg leading-tight mb-1 group-hover:opacity-60 transition-opacity">
            {{ item.title }}
          </h3>
          <p class="text-base text-black/70 dark:text-white/70 font-medium">{{ item.artist }}</p>
        </NuxtLink>
      </div>

      <div class="flex justify-center">
        <NuxtLink to="/archive">
          <button class="group inline-flex items-center gap-3 border-2 border-black dark:border-white px-8 py-3 font-bold text-sm tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            {{ t('highlights.viewAll') }}
            <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════════════ ABOUT ═══════════════════════ -->
    <section class="bg-black dark:bg-white text-white dark:text-black border-t border-white/5 dark:border-black/5">
      <div class="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-display font-black mb-8 leading-tight">
              {{ t('about.title') }}
            </h2>
            <p class="dropcap text-base md:text-lg text-white/70 dark:text-black/70 mb-6 leading-relaxed">
              {{ t('about.body1') }}
            </p>
            <p class="text-base md:text-lg text-white/70 dark:text-black/70 leading-relaxed">
              {{ t('about.body2') }}
            </p>
          </div>
          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
              alt="VIERNULVIER archive"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 border border-white/10 dark:border-black/10" />
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════ DISCOVER MORE ═══════════════════════ -->
    <section class="py-24">
      <div class="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto mb-12">
        <h2 class="text-3xl md:text-4xl font-display font-black">
          {{ t('discover.title') }}
        </h2>
      </div>

      <div class="grid md:grid-cols-2" style="height: 520px;">
        <!-- Stories card -->
        <NuxtLink to="/blogs" class="group relative overflow-hidden block">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80"
            alt="Stories and History"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
          <div class="relative h-full flex flex-col justify-end p-10 md:p-12">
            <h3 class="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
              {{ t('discover.stories.title') }}
            </h3>
            <p class="text-sm text-white/70 leading-relaxed mb-8 max-w-sm">{{ t('discover.stories.body') }}</p>
            <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
              {{ t('discover.stories.cta') }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>

        <!-- Posters card -->
        <NuxtLink to="/uploads" class="group relative overflow-hidden block">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80"
            alt="Posters and Printed Materials"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
          <div class="relative h-full flex flex-col justify-end p-10 md:p-12">
            <h3 class="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight">
              {{ t('discover.posters.title') }}
            </h3>
            <p class="text-sm text-white/70 leading-relaxed mb-8 max-w-sm">{{ t('discover.posters.body') }}</p>
            <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
              {{ t('discover.posters.cta') }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Footer is a shared component -->
    <Footer />
  </div>
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
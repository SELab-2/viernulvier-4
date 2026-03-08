
<script setup lang="ts">
import { ArrowRight, Calendar, FileText, ImageIcon } from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()


// mock data, replace with actual data !!!!!

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
    image: 'https://images.unsplash.com/photo-1576848933451-c9c82f857ee4?w=600&q=80',
  },
  {
    id: 6,
    title: 'Jazz in Gent',
    artist: 'Blue Note Trio',
    dates: ['2024-01-25'],
    category: 'Muziek',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&q=80',
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

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased">
    <section class="relative h-[85vh] min-h-[560px] overflow-hidden bg-black">
      <!-- mock photo -->
      <img
        src="https://images.unsplash.com/photo-1765278624799-9c90305b0b7e?w=1400&q=80" 
        alt="VIERNULVIER performance"
        class="absolute inset-0 w-full h-full object-cover opacity-50 hero-img"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <!-- Language toggle (later in header) -->
      <div class="absolute top-6 right-6 z-30">
        <button
          @click="toggleLocale"
          class="px-3 py-1.5 border border-white/30 text-sm text-white font-mono hover:bg-white hover:text-black transition-all duration-200 tracking-widest"
        >
          {{ locale.toUpperCase() }}
        </button>
      </div>

      <div class="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 max-w-7xl mx-auto w-full">
        <p class="text-xs font-mono tracking-[0.3em] uppercase text-white/50 mb-6">
          {{ t('hero.label') }}
        </p>
        <div class="mb-8">
          <h1 class="hero-title font-display font-black text-white uppercase leading-none tracking-tight">
            VIERNULVIER
          </h1>
          <p class="hero-archief font-display font-light text-white/90 leading-none tracking-tight">
            Archief
          </p>
        </div>

        <p class="text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
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

    <!-- ══════════════════════════════ ARCHIVE HIGHLIGHTS ══════════════════════════════ -->
    <section class="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-black/10 dark:border-white/10 pb-6">
        <div>
          <p class="text-xs font-mono tracking-[0.25em] uppercase text-black/40 dark:text-white/40 mb-2">
            {{ t('highlights.label') }}
          </p>
          <h2 class="text-3xl md:text-4xl font-display font-black tracking-tight">
            {{ t('highlights.title') }}
          </h2>
        </div>
        <p class="text-sm text-black/50 dark:text-white/50 max-w-xs text-right hidden sm:block">
          {{ t('highlights.subtitle') }}
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14">
        <NuxtLink
          v-for="(item, i) in highlights"
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

            <div class="absolute top-3 left-3 text-white/25 font-mono text-xs font-bold">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
          </div>

          <h3 class="font-display font-bold text-lg leading-tight mb-1 group-hover:opacity-60 transition-opacity">
            {{ item.title }}
          </h3>
          <p class="text-sm text-black/50 dark:text-white/50 font-mono">{{ item.artist }}</p>
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

    <!-- ═══════════════════════════════ ABOUT SECTION ══════════════════════════════════ -->
    <section class="bg-black dark:bg-white text-white dark:text-black border-t border-white/5 dark:border-black/5">
      <div class="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p class="text-xs font-mono tracking-[0.25em] uppercase text-white/40 dark:text-black/40 mb-4">
              {{ t('about.label') }}
            </p>
            <h2 class="text-3xl md:text-4xl font-display font-black mb-8 leading-tight">
              {{ t('about.title') }}
            </h2>
            <p class="dropcap text-base md:text-lg text-white/70 dark:text-black/70 mb-6 leading-relaxed">
              {{ t('about.body1') }}
            </p>
            <p class="text-base md:text-lg text-white/50 dark:text-black/50 leading-relaxed">
              {{ t('about.body2') }}
            </p>
          </div>

          <div class="relative aspect-[4/3] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
              alt="VIERNULVIER archief"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 border border-white/10 dark:border-black/10" />
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════ DISCOVER MORE ═══════════════════════════════════ -->
    <section class="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
      <div class="mb-12">
        <p class="text-xs font-mono tracking-[0.25em] uppercase text-black/40 dark:text-white/40 mb-2">
          {{ t('discover.label') }}
        </p>
        <h2 class="text-3xl md:text-4xl font-display font-black">
          {{ t('discover.title') }}
        </h2>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <NuxtLink
          to="/blogs"
          class="group relative overflow-hidden border border-black/10 dark:border-white/10 p-8 md:p-10 hover:border-black dark:hover:border-white transition-colors bg-black/[0.02] dark:bg-white/[0.02]"
        >
          <div class="absolute top-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
          <FileText class="w-10 h-10 mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
          <h3 class="text-xl md:text-2xl font-display font-black mb-3">{{ t('discover.stories.title') }}</h3>
          <p class="text-sm text-black/50 dark:text-white/50 leading-relaxed mb-6">{{ t('discover.stories.body') }}</p>
          <div class="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            {{ t('discover.stories.cta') }}
            <ArrowRight class="w-3.5 h-3.5" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/uploads"
          class="group relative overflow-hidden border border-black/10 dark:border-white/10 p-8 md:p-10 hover:border-black dark:hover:border-white transition-colors bg-black/[0.02] dark:bg-white/[0.02]"
        >
          <div class="absolute top-0 left-0 w-0 h-0.5 bg-black dark:bg-white group-hover:w-full transition-all duration-500" />
          <ImageIcon class="w-10 h-10 mb-6 opacity-60 group-hover:opacity-100 transition-opacity" />
          <h3 class="text-xl md:text-2xl font-display font-black mb-3">{{ t('discover.posters.title') }}</h3>
          <p class="text-sm text-black/50 dark:text-white/50 leading-relaxed mb-6">{{ t('discover.posters.body') }}</p>
          <div class="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            {{ t('discover.posters.cta') }}
            <ArrowRight class="w-3.5 h-3.5" />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ════════════════════════════════════ FOOTER ════════════════════════════════════ -->
    <footer class="border-t border-black/10 dark:border-white/10 bg-black dark:bg-white text-white dark:text-black">
      <div class="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-10 mb-12 pb-12 border-b border-white/10 dark:border-black/10">
          <div class="md:col-span-2">
            <h3 class="font-display font-black text-3xl mb-3 tracking-tight">VIERNULVIER</h3>
            <p class="text-sm text-white/50 dark:text-black/50">{{ t('footer.tagline') }}</p>
          </div>

          <div>
            <h4 class="text-xs font-mono tracking-[0.2em] uppercase text-white/40 dark:text-black/40 mb-4">
              {{ t('footer.links') }}
            </h4>
            <ul class="space-y-2.5 text-sm">
              <li>
                <a href="https://www.viernulvier.gent/" target="_blank" rel="noopener noreferrer"
                   class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.mainSite') }}
                </a>
              </li>
              <li>
                <NuxtLink to="/archive" class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.archive') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blogs" class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.stories') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/uploads" class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.prints') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 class="text-xs font-mono tracking-[0.2em] uppercase text-white/40 dark:text-black/40 mb-4">Social</h4>
            <ul class="space-y-2.5 text-sm">
              <li>
                <a href="https://www.instagram.com/viernulvier.gent/" target="_blank" rel="noopener noreferrer"
                   class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">Instagram</a>
              </li>
              <li>
                <a href="https://www.facebook.com/VIERNULVIER.gent/" target="_blank" rel="noopener noreferrer"
                   class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">Facebook</a>
              </li>
              <li>
                <a href="https://www.youtube.com/channel/UCdRYlqUQcIm6pbLgHHobQcQ" target="_blank" rel="noopener noreferrer"
                   class="text-white/60 dark:text-black/60 hover:text-white dark:hover:text-black transition-colors">YouTube</a>
              </li>
            </ul>
          </div>
        </div>

        <p class="text-xs font-mono text-white/30 dark:text-black/30 tracking-widest uppercase text-center">
          © {{ new Date().getFullYear() }} VIERNULVIER — {{ t('footer.rights') }}
        </p>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.font-display {
  font-family: 'Georgia', 'Times New Roman', serif;
}
.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

/* VIERNULVIER — groot en bold */
.hero-title {
  font-size: clamp(3.5rem, 10vw, 8rem);
}

/* Archief — iets kleiner, lichtgewicht, sluit aan op de mock-up */
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
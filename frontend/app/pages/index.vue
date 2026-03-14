<script setup lang="ts">
import { ArrowRight, Calendar, Sun, Moon } from 'lucide-vue-next'

const { t, locale, setLocale } = useI18n()

// Dark mode
const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

// Language toggle
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

      <!-- Top-right controls: dark mode + language (will move to header later) -->
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

      <!-- Hero content -->
      <div class="relative z-20 h-full flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-16 max-w-7xl mx-auto w-full">
        <div class="mb-8">
          <h1 class="hero-title font-display font-black text-white uppercase leading-none tracking-tight">
            VIERNULVIER
          </h1>
          <!-- "Archief" / "Archive" depending on locale -->
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

    <!-- ═══════════════════════ ABOUT ═══════════════════════ -->
    <section class="bg-black dark:bg-white text-white dark:text-black border-t border-white/5 dark:border-black/5">
      <div class="px-6 md:px-12 lg:px-20 py-24 max-w-7xl mx-auto">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-display font-black mb-8 leading-tight">
              {{ t('about.title') }}
            </h2>
            <!-- Both paragraphs same color for consistent readability -->
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

      <!-- Full-bleed image cards -->
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
            <p class="text-sm text-white/70 leading-relaxed mb-8 max-w-sm">
              {{ t('discover.stories.body') }}
            </p>
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
            <p class="text-sm text-white/70 leading-relaxed mb-8 max-w-sm">
              {{ t('discover.posters.body') }}
            </p>
            <div class="inline-flex items-center gap-3 text-white font-mono text-xs font-bold uppercase tracking-widest border-b border-white/30 pb-1 w-fit group-hover:border-white transition-colors duration-300">
              {{ t('discover.posters.cta') }}
              <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ═══════════════════════ FOOTER ═══════════════════════ -->
    <footer class="border-t border-black/10 dark:border-white/10 bg-black dark:bg-white text-white dark:text-black">
      <div class="px-6 md:px-12 lg:px-20 py-16 max-w-7xl mx-auto">
        <div class="grid md:grid-cols-3 gap-10 mb-12 pb-12 border-b border-white/10 dark:border-black/10">

          <!-- Brand + contact info -->
          <div class="md:col-span-1">
            <h3 class="font-display font-black text-2xl mb-1 tracking-tight">VIERNULVIER</h3>
            <p class="text-sm text-white/60 dark:text-black/60 mb-6">{{ t('footer.tagline') }}</p>
            <address class="not-italic text-sm text-white/60 dark:text-black/60 leading-relaxed space-y-0.5">
              <p>Kunstencentrum VIERNULVIER vzw.</p>
              <p>Sint-Pietersnieuwstraat 23</p>
              <p>9000 Gent</p>
              <p class="mt-2">T. 09 267 28 20</p>
              <p>
                <a href="mailto:info@viernulvier.gent" class="hover:text-white dark:hover:text-black transition-colors">
                  info@viernulvier.gent
                </a>
              </p>
              <p class="mt-1 text-white/40 dark:text-black/40 text-xs">BTW BE 0423.063.619</p>
            </address>
          </div>

          <!-- Navigation links -->
          <div>
            <h4 class="text-xs font-mono tracking-[0.2em] uppercase text-white/60 dark:text-black/60 mb-4">
              {{ t('footer.links') }}
            </h4>
            <ul class="space-y-2.5 text-sm">
              <li>
                <a href="https://www.viernulvier.gent/" target="_blank" rel="noopener noreferrer"
                   class="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.mainSite') }}
                </a>
              </li>
              <li>
                <NuxtLink to="/archive" class="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.archive') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blogs" class="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.stories') }}
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/uploads" class="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black transition-colors">
                  {{ t('footer.prints') }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Social icons -->
          <div>
            <h4 class="text-xs font-mono tracking-[0.2em] uppercase text-white/60 dark:text-black/60 mb-4">Social</h4>
            <div class="flex flex-wrap gap-3">
              <!-- Instagram -->
              <a href="https://www.instagram.com/viernulvier.gent/" target="_blank" rel="noopener noreferrer"
                 aria-label="Instagram"
                 class="p-2.5 border border-white/20 dark:border-black/20 text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black hover:border-white dark:hover:border-black transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <!-- Facebook -->
              <a href="https://www.facebook.com/VIERNULVIER.gent/" target="_blank" rel="noopener noreferrer"
                 aria-label="Facebook"
                 class="p-2.5 border border-white/20 dark:border-black/20 text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black hover:border-white dark:hover:border-black transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <!-- TikTok -->
              <a href="https://www.tiktok.com/@viernulvier.gent" target="_blank" rel="noopener noreferrer"
                 aria-label="TikTok"
                 class="p-2.5 border border-white/20 dark:border-black/20 text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black hover:border-white dark:hover:border-black transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>

              <!-- YouTube -->
              <a href="https://www.youtube.com/channel/UCdRYlqUQcIm6pbLgHHobQcQ" target="_blank" rel="noopener noreferrer"
                 aria-label="YouTube"
                 class="p-2.5 border border-white/20 dark:border-black/20 text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black hover:border-white dark:hover:border-black transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <!-- LinkedIn -->
              <a href="https://www.linkedin.com/company/viernulviergent" target="_blank" rel="noopener noreferrer"
                 aria-label="LinkedIn"
                 class="p-2.5 border border-white/20 dark:border-black/20 text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black hover:border-white dark:hover:border-black transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
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
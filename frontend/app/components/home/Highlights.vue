<!--
  HomeHighlights.vue

  Implements the "Highlights" section on the home page.

  Displays a responsive grid of recent production cards (2 columns on tablet,
  3 on desktop). Each card shows:
  - A cover image with a hover zoom effect and a bottom-to-top gradient overlay
  - A category badge in the top-right corner of the image
  - A formatted date badge with a calendar icon in the bottom-left corner
  - The production title and artist name below the image

  Clicking a card navigates to the production detail page (ROUTES.productions.byId).
  The "View all" button at the bottom links to the full archive page (ROUTES.productions.base).

  Date formatting:
    Dates are formatted via toLocaleDateString() using the active locale:
    - 'nl' → nl-BE (e.g. "10 maart 2024")
    - 'en' → en-GB (e.g. "10 March 2024")

  Data:
    Currently uses hardcoded mock data (highlights array below).
    TODO: replace with real API data once the database is connected.
    TODO: replace this grid with the shared ArchiveGrid component once
          it is implemented in /components.
-->
<script setup lang="ts">
import { ArrowRight, Calendar } from 'lucide-vue-next'
import { ROUTES } from '~/utils/routes'

const { t, locale } = useI18n()

// TODO: replace with real API data once the database is connected
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

/**
 * Formats a date string into a human-readable, locale-aware date.
 * Returns an empty string if no date is provided.
 */
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
  <!-- TODO: replace grid with shared ArchiveGrid component once implemented in /components -->
  <section class="px-6 md:px-12 lg:px-20 py-20 max-w-7xl mx-auto">
    <!-- Section header with subtitle on the right -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 border-b border-black/10 dark:border-white/10 pb-6">
      <h2 class="text-3xl md:text-4xl font-display font-black tracking-tight">
        {{ t('highlights.title') }}
      </h2>
      <p class="text-base text-black/70 dark:text-white/70 whitespace-nowrap hidden sm:block">
        {{ t('highlights.subtitle') }}
      </p>
    </div>

    <!-- Production cards grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mb-14">
      <NuxtLink
        v-for="item in highlights"
        :key="item.id"
        :to="ROUTES.productions.byId(item.id)"
        class="group block"
      >
        <div class="relative overflow-hidden aspect-[4/3] bg-black/5 dark:bg-white/5 mb-4">
          <img
            :src="item.image"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          />
          <!-- Gradient overlay to ensure badges are readable over any image -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <!-- Date badge: bottom-left, locale-formatted -->
          <div class="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white font-mono">
            <Calendar class="w-3 h-3 shrink-0" />
            <span>{{ formatDate(item.dates[0]) }}</span>
          </div>

          <!-- Category badge: top-right, uppercase -->
          <div class="absolute top-3 right-3 px-2 py-0.5 bg-white dark:bg-black text-black dark:text-white text-[10px] font-mono font-bold uppercase tracking-widest">
            {{ item.category }}
          </div>
        </div>

        <!-- Title fades on hover to indicate interactivity -->
        <h3 class="font-display font-bold text-lg leading-tight mb-1 group-hover:opacity-60 transition-opacity">
          {{ item.title }}
        </h3>
        <p class="text-base text-black/70 dark:text-white/70 font-medium">{{ item.artist }}</p>
      </NuxtLink>
    </div>

    <!-- "View all" CTA linking to the full archive -->
    <div class="flex justify-center">
      <NuxtLink :to="ROUTES.productions.base">
        <button class="group inline-flex items-center gap-3 border-2 border-black dark:border-white px-8 py-3 font-bold text-sm tracking-wide hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
          {{ t('highlights.viewAll') }}
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
</style>
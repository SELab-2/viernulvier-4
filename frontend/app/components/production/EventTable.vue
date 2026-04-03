<script setup lang="ts">/**
 * A reusable event table component, displays events belonging to a specific production in a table, includes:
 *  - Time, location, price displayed per event
 *  - Sorting of events
 *  - Scrollable when there are more than 3 events
 *
 * Usage:
 * <EventTable
 *    :events="events"
 * />
 *
 * Example events: (There are 2 ways to create a date)
 * const events: EventItem[] = [
 *    { id: '1', date: new Date(2026, 2, 10, 19, 30), location: 'Antwerpen', price: '€ 15,00' },
 *    { id: '2', date: new Date('2026-03-29T19:30:00'), location: 'Gent', price: '€ 12,50' }
 * ]
 */

import type { Event, LocationView, PriceView } from "@repo/common";
const { t, locale } = useI18n()
import { CalendarDays, MapPin, Euro, Clock } from "lucide-vue-next";

type EventWithDetails = Event & { // combining info from tables into one single type
  locations: LocationView[];
  prices: PriceView[];
}

interface Props {
  events: EventWithDetails[]
}
const props = defineProps<Props>()

// function to format the date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// function to format the time
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// function to format the price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(price)
}

const sortedEvents = computed(() =>
    [...props.events].sort( // function to sort the events, oldest first
        (a, b) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime()
    )
)

// constants
const tableBase = 'bg-muted border border-border rounded-lg'
const headerWide = 'text-left p-4 w-[40%]'
const headerNarrow = 'text-left p-4 w-[20%]'
const headerIcon = 'flex items-center gap-1.5'
const headerIconSize = 13
const cellWide = 'p-4 text-[12px] w-[40%] max-w-0'
const cellNarrow = 'p-4 text-[12px] w-[20%] max-w-0'
</script>

<template>
  <div class="m-4">
    <!-- title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      {{ t('production.events') }}
    </h3>

    <div
        v-if="events.length"
        :class="[tableBase, 'overflow-hidden']"
    >
      <div class="overflow-y-auto max-h-[20rem]">
        <table class="w-full">
          <!-- Header -->
          <thead class="sticky top-0">
          <tr class="bg-foreground/80 dark:bg-foreground/60 text-background text-[11px] uppercase tracking-widest">
            <th :class="headerWide"><span :class="headerIcon"><CalendarDays :size="headerIconSize" />{{ t('production.dateAndTime') }}</span></th>
            <th :class="headerWide"><span :class="headerIcon"><MapPin :size="headerIconSize" />{{ t('production.location') }}</span></th>
            <th :class="headerNarrow"><span :class="headerIcon"><Euro :size="headerIconSize" />{{ t('production.price') }}</span></th>
          </tr>
          </thead>
        <!-- Body -->
          <tbody>
            <tr
                v-for="event in sortedEvents"
                :key="event.id"
                class="
                  border-t border-border
                  hover:bg-background/70
                  transition-colors
                "
            >
              <!-- Date -->
              <td :class="cellWide">
                <p class="font-bold text-[12px] truncate">{{ formatDate(event.starttime) }}</p>
                <p class="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 truncate"><Clock :size="10" class="shrink-0" />{{ formatTime(event.starttime) }}</p>
              </td>

              <!-- Location -->
              <td :class="cellWide">
                <p class="truncate">{{ event.locations.map(l => l.location).join(', ') || '-' }}</p>
              </td>

              <!-- Price -->
              <td :class="cellNarrow">
                <p v-for="p in event.prices" :key="p.id" class="truncate">
                  {{ p.name }} {{ formatPrice(p.price) }}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty table -->
    <div
        v-else
        :class="[tableBase, 'p-4 text-[11px] text-muted-foreground']"
    >
      {{ t('production.noEvents') }}
    </div>
  </div>
</template>

<style scoped>
</style>
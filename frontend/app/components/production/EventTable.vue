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
import type {EventItem} from "../../types/EventItem";
const { t, locale } = useI18n()

interface Props {
  events: EventItem[]
}
const props = defineProps<Props>()

// function to format the date
const formatDate = (date: Date) => {
  return date.toLocaleDateString(locale.value, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// function to format the time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString(locale.value, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortedEvents = computed(() => { // function to sort the events, oldest first
  return [...props.events].sort((a, b) => a.date.getTime() - b.date.getTime())
})
</script>

<template>
  <div class="m-4">
    <!-- title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      {{ t('production.events') }}
    </h3>

    <div
        v-if="events.length"
        class="bg-muted border border-border rounded-lg overflow-hidden"
    >
      <table class="w-full">
        <!-- Header -->
        <thead>
        <tr class="bg-foreground text-background text-[11px] uppercase tracking-widest">
          <th class="text-left p-4 w-[40%]">{{ t('production.dateAndTime') }}</th>
          <th class="text-left p-4 w-[40%]">{{ t('production.location') }}</th>
          <th class="text-left p-4 w-[20%]">{{ t('production.price') }}</th>
        </tr>
        </thead>

      </table>

      <div class="overflow-y-auto max-h-[15rem]">
        <table class="w-full">
        <!-- Body -->
          <tbody>
            <tr
                v-for="event in sortedEvents"
                :key="event.id"
                class="
                  border-t border-border
                  hover:bg-background
                  transition-colors
                "
            >
              <!-- Date -->
              <td class="p-4 w-[40%]">
                <p class="font-bold text-[12px]">
                  {{ formatDate(event.date) }}
                </p>
                <p class="text-[10px] text-muted-foreground mt-1">
                  {{ formatTime(event.date) }}
                </p>
              </td>

              <!-- Location -->
              <td class="p-4 text-[12px] w-[40%]">
                {{ event.location }}
              </td>

              <!-- Price -->
              <td class="p-4 text-[12px] font-bold w-[20%]">
                {{ event.price }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty table -->
    <div
        v-else
        class="bg-muted border border-border rounded-lg p-4 text-[11px] text-muted-foreground"
    >
      {{ t('production.noEvents') }}
    </div>
  </div>
</template>

<style scoped>
</style>
<script setup lang="ts">/**
 * A reusable event table component, displays events belonging to a specific production in a table, includes:
 *  - Time, location, price displayed per event
 *  - Sorting of events
 *
 * Usage:
 * TODO
 */
import type {EventItem} from "../../types/EventItem";

interface Props {
  events: EventItem[]
}
const props = defineProps<Props>()

// function to format the date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('nl', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// function to format the time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('nl', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sortedEvents = computed(() => { // function to sort the events, oldest first
  return [...props.events].sort((a, b) => a.date.getTime() - b.date.getTime())
})
//TODO: wat met super veel events?
</script>

<template>
  <div class="m-4">
    <!-- title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      Evenementen
    </h3>

    <div
        v-if="events.length"
        class="bg-muted border border-border rounded-lg overflow-hidden"
    >
      <table class="w-full">
        <!-- Header -->
        <thead>
        <tr class="bg-foreground text-background text-[11px] uppercase tracking-widest">
          <th class="text-left p-4">Datum & Tijd</th>
          <th class="text-left p-4">Locatie</th>
          <th class="text-left p-4">Prijs</th>
        </tr>
        </thead>

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
          <td class="p-4">
            <p class="font-bold text-[12px]">
              {{ formatDate(event.date) }}
            </p>
            <p class="text-[10px] text-muted-foreground mt-1">
              {{ formatTime(event.date) }}
            </p>
          </td>

          <!-- Location -->
          <td class="p-4 text-[12px]">
            {{ event.location }}
          </td>

          <!-- Price -->
          <td class="p-4 text-[12px] font-bold">
            {{ event.price }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty table -->
    <div
        v-else
        class="bg-muted border border-border rounded-lg p-4 text-[11px] text-muted-foreground"
    >
      Deze productie bevat geen evenementen.
    </div>
  </div>
</template>

<style scoped>
</style>
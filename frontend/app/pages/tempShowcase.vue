<script setup lang="ts">
import EventTable from "../components/production/EventTable.vue";
import type { LocationView, PriceView } from "@repo/common";
import type { EventWithDetails } from "../types/EventWithDetails";

const mockLocation = (name: string): LocationView => ({
  id: 1, location: name, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
})

const mockPrice = (amount: number): PriceView => ({
  id: 1, price: amount, name: 'Volwassenen', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
})
const mockPrice2 = (amount: number): PriceView => ({
  id: 2, price: amount, name: 'Kinderen', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z'
})

const base = { endtime: null, doors_at: null, intermission_at: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', production_id: 1 }

const events1 = [ // 3 events
  { ...base, id: 1, starttime: '2026-02-10T19:30:00Z', locations: [mockLocation('Event 1 location')], prices: [mockPrice(30), mockPrice2(25)] },
  { ...base, id: 2, starttime: '2025-06-07T02:15:00Z', locations: [mockLocation('Event 2 location 1'), mockLocation('Event 2 location 2'), mockLocation('Event 2 location 3')], prices: [mockPrice(25)] },
  { ...base, id: 3, starttime: '2026-10-07T15:20:00Z', locations: [mockLocation('Event 3 location 1'), mockLocation('Event 3 location 2')], prices: [mockPrice(25)] },
]

const events2: EventWithDetails[] = [] // no events

const events3 = [ // more than 3 events
  { ...base, id: 1, starttime: '2026-02-10T19:30:00Z', locations: [mockLocation('Event 1 location')], prices: [mockPrice(30)] },
  { ...base, id: 2, starttime: '2025-06-07T02:15:00Z', locations: [mockLocation('Event 2 location')], prices: [mockPrice(25)] },
  { ...base, id: 3, starttime: '2026-10-07T15:20:00Z', locations: [mockLocation('Event 3 location')], prices: [mockPrice(25)] },
  { ...base, id: 4, starttime: '2026-02-10T19:30:00Z', locations: [mockLocation('Event 1 location')], prices: [mockPrice(30)] },
  { ...base, id: 5, starttime: '2025-06-07T02:15:00Z', locations: [mockLocation('Event 2 location')], prices: [mockPrice(25)] },
  { ...base, id: 6, starttime: '2026-10-07T15:20:00Z', locations: [mockLocation('Event 3 location')], prices: [mockPrice(25)] },
]
</script>

<template>
  <div class="p-8">
    <EventTable :events="events1" />
  </div>
  <div class="p-8">
    <EventTable :events="events2" />
  </div>
  <div class="p-8">
    <EventTable :events="events3" />
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import EventTable from "../components/production/EventTable.vue";
import type {EventItem} from "../types/EventItem";

const events1 = [
  {
    id: '1',
    date: new Date(2026, 2, 10, 19, 30),
    location: 'Event 1',
    price: '€30'
  },
  {
    id: '2',
    date: new Date(2025, 6, 7, 2, 15),
    location: 'Event 2',
    price: '€25'
  },
  {
    id: '3',
    date: new Date(2026, 10, 7, 15, 20),
    location: 'Event 3',
    price: '€25'
  }
]

const events2: EventItem[] = []
</script>

<template>
  <div class="p-8">
    <EventTable :events="events1" />
  </div>
  <div class="p-8">
    <EventTable :events="events2" />
  </div>
</template>

<style scoped>

</style>
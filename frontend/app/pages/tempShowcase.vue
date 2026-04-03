<script setup lang="ts">
import EventTable from "../components/production/EventTable.vue";
import type {EventItem} from "../types/EventItem";

const events1 = [ // 3 events
  {
    id: '1',
    date: new Date(2026, 2, 10, 19, 30),
    location: 'Event 1 location',
    price: '€30'
  },
  {
    id: '2',
    date: new Date(2025, 6, 7, 2, 15),
    location: 'Event 2 location',
    price: '€25'
  },
  {
    id: '3',
    date: new Date(2026, 10, 7, 15, 20),
    location: 'Event 3 location',
    price: '€25'
  }
]

const events2: EventItem[] = [] // no events

const events3 = [ // more than 3 events
  {
    id: '1',
    date: new Date(2026, 2, 10, 19, 30),
    location: 'Event 1 location',
    price: '€30'
  },
  {
    id: '2',
    date: new Date(2025, 6, 7, 2, 15),
    location: 'Event 2 location',
    price: '€25'
  },
  {
    id: '3',
    date: new Date(2026, 10, 7, 15, 20),
    location: 'Event 3 location',
    price: '€25'
  },
  {
    id: '4',
    date: new Date(2026, 2, 10, 19, 30),
    location: 'Event 4 location',
    price: '€30'
  },
  {
    id: '5',
    date: new Date(2025, 6, 7, 2, 15),
    location: 'Event 5 location',
    price: '€25'
  },
  {
    id: '6',
    date: new Date(2026, 10, 7, 15, 20),
    location: 'LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOONG LOCATIOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOON',
    price: '€25'
  }
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
<script setup lang="ts">
import type { EventWithDetails } from "../types/EventWithDetails";

definePageMeta({
  path: "/tempShowcase",
});

interface MockProduction {
  id: number;
  title: string;
}

type EventListItem = EventWithDetails & {
  productionTitle: string;
};

const mockProductions: MockProduction[] = [
  { id: 1, title: "Bodies of Light" },
  { id: 2, title: "Night Shift Reverie" },
  { id: 3, title: "Archive of Echoes" },
];

const mockEvents: EventWithDetails[] = [
  {
    id: 101,
    production_id: 1,
    starttime: "2026-06-10T19:30:00",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    location: {
      id: 1,
      location: "De Vooruit, Gent",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    prices: [
      {
        id: 1,
        price: 18,
        name: "Standard",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: 102,
    production_id: 2,
    starttime: "2026-06-12T20:00:00",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    location: {
      id: 2,
      location: "KVS, Brussel",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    prices: [
      {
        id: 2,
        price: 16,
        name: "Standard",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 22,
        price: 12,
        name: "Student",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: 23,
        price: 10,
        name: "Kansentarief",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: 103,
    production_id: 1,
    starttime: "2026-06-20T19:00:00",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    location: {
      id: 3,
      location: "Stadsschouwburg, Antwerpen",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    prices: [
      {
        id: 3,
        price: 21,
        name: "Premium",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: 104,
    production_id: 3,
    starttime: "2026-07-02T20:30:00",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    location: {
      id: 4,
      location: "Muziekcentrum, Brugge",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    prices: [
      {
        id: 4,
        price: 14,
        name: "Standard",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
];

const listEvents: EventListItem[] = mockEvents.map((event) => {
  const productionTitle =
    mockProductions.find((p) => p.id === event.production_id)?.title ??
    "Unknown Production";

  return {
    ...event,
    productionTitle,
  };
});

const emptyEvents: EventListItem[] = [];
</script>

<template>
  <section class="min-h-[70vh] py-12 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">TempShowcase</h1>
        <p class="text-sm text-muted-foreground">
          Simple examples of the event list view.
        </p>
      </header>

      <div class="space-y-2">
        <h2
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
        >
          Example with events
        </h2>
        <EventListView :events="listEvents" />
      </div>

      <div class="space-y-2">
        <h2
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground"
        >
          Example with 0 events
        </h2>
        <EventListView :events="emptyEvents" />
      </div>
    </div>
  </section>
</template>

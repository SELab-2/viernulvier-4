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

const { locale } = useI18n();

const mockProductions: MockProduction[] = [
  { id: 1, title: "Bodies of Light" },
  { id: 2, title: "Night Shift Reverie" },
  { id: 3, title: "Archive of Echoes" },
];

const mockEvents = ref<EventWithDetails[]>([
  {
    id: 101,
    production_id: 1,
    starttime: "2026-06-10T19:30:00",
    endtime: null,
    doors_at: null,
    intermission_at: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    locations: [
      {
        id: 1,
        location: "De Vooruit, Gent",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
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
    locations: [
      {
        id: 2,
        location: "KVS, Brussel",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
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
    locations: [
      {
        id: 3,
        location: "Stadsschouwburg, Antwerpen",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
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
    locations: [
      {
        id: 4,
        location: "Muziekcentrum, Brugge",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ],
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
]);

const search = ref("");

const listEvents = computed<EventListItem[]>(() => {
  return mockEvents.value.map((event) => {
    const productionTitle =
      mockProductions.find((p) => p.id === event.production_id)?.title ??
      "Unknown Production";

    return {
      ...event,
      productionTitle,
    };
  });
});

const filteredEvents = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return listEvents.value;

  return listEvents.value.filter((event) => {
    const venue = event.locations[0]?.location ?? "";
    const priceText = event.prices
      .map((price) => `${price.name} eur ${price.price}`)
      .join(" ");

    return (
      event.productionTitle.toLowerCase().includes(query) ||
      venue.toLowerCase().includes(query) ||
      priceText.toLowerCase().includes(query)
    );
  });
});

const actionMessage = ref("");

const onEdit = (event: EventListItem) => {
  actionMessage.value = `Edit clicked for event #${event.id}`;
};

const onDelete = (payload: { id: number | string; title: string }) => {
  mockEvents.value = mockEvents.value.filter(
    (event) => event.id !== payload.id,
  );
  actionMessage.value = `Deleted event #${payload.id} (${payload.title})`;
};
</script>

<template>
  <section class="min-h-[70vh] py-12 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">TempShowcase</h1>
        <p class="text-sm text-muted-foreground">
          Reusable event list view with mock data, filter, edit action, and
          delete action.
        </p>
      </header>

      <div class="rounded-xl border border-border bg-muted/40 p-4 sm:p-5">
        <label
          for="temp-event-search"
          class="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2"
        >
          {{ locale === "nl" ? "Filter events" : "Filter events" }}
        </label>
        <input
          id="temp-event-search"
          v-model="search"
          type="text"
          :placeholder="
            locale === 'nl'
              ? 'Zoek op productie, locatie of prijs'
              : 'Search by production, venue, or price'
          "
          class="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/30"
        />
      </div>

      <p
        v-if="actionMessage"
        class="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {{ actionMessage }}
      </p>

      <EventListView
        :events="filteredEvents"
        @edit="onEdit"
        @delete="onDelete"
      />
    </div>
  </section>
</template>

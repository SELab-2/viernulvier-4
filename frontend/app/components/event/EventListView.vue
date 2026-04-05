<script setup lang="ts">
/**
 * A reusable event list component, displays events in a card-style list, includes:
 *  - Production title, location, date/time and prices per event
 *  - Edit action that emits the full event and navigates to the edit route
 *  - Delete action with confirmation popup
 *  - Empty-state message when no events are available
 *
 * Usage:
 * <EventListView
 *   :events="events"
 *   @edit="onEdit"
 *   @delete="onDelete"
 * />
 *
 * Example events:
 * const events: EventListItem[] = [
 *   {
 *     id: 101,
 *     production_id: 1,
 *     starttime: "2026-06-10T19:30:00",
 *     endtime: null,
 *     doors_at: null,
 *     intermission_at: null,
 *     created_at: "2026-01-01T00:00:00.000Z",
 *     updated_at: "2026-01-01T00:00:00.000Z",
 *     location: { id: 1, location: "De Vooruit, Gent", created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" },
 *     prices: [{ id: 1, price: 18, name: "Standard", created_at: "2026-01-01T00:00:00.000Z", updated_at: "2026-01-01T00:00:00.000Z" }],
 *     productionTitle: "Bodies of Light"
 *   }
 * ]
 */
import { Edit2, Trash2 } from "lucide-vue-next";
import type { EventWithDetails } from "../../types/EventWithDetails";

type Id = number | string;

type EventListItem = EventWithDetails & {
  productionTitle: string;
};

interface Props {
  events: EventListItem[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", event: EventListItem): void;
  (e: "delete", payload: { id: Id; title: string }): void;
}>();

const { t, locale } = useI18n();

// function to format the date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// function to format the time
const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// function to format the price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

// function to get the price text for an event
const getPricesText = (event: EventWithDetails) => {
  if (!event.prices.length) return "-";
  return event.prices
    .map((price) => `${price.name}: ${formatPrice(price.price)}`)
    .join(" | ");
};

// function to handle delete action with confirmation
const onDelete = (item: EventListItem) => {
  const isConfirmed = confirm(t("eventlist.confirmDelete"));
  if (!isConfirmed) return;

  emit("delete", {
    id: item.id,
    title: item.productionTitle || "Unknown Production",
  });
};

// function to handle edit action, emits the full event and navigates to the edit route
const onEdit = (event: EventListItem) => {
  emit("edit", event);
  navigateTo(`/admin/events/edit/${event.id}`);
};
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="item in events"
      :key="item.id"
      class="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
    >
      <!-- Event details -->
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-lg truncate">
          {{ item.productionTitle || "Unknown Production" }}
        </h3>
        <p class="text-xs text-gray-500 uppercase tracking-widest truncate">
          {{ item.location.location }} - {{ formatDate(item.starttime) }},
          {{ formatTime(item.starttime) }}
        </p>
        <p class="text-xs font-bold mt-1">
          {{ t("eventlist.price") }}: {{ getPricesText(item) }}
        </p>
      </div>

      <div class="flex gap-2 ml-auto items-center">
        <!-- Edit Button -->
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :aria-label="t('eventlist.edit')"
          @click="onEdit(item)"
        >
          <Edit2 class="w-5 h-5" />
        </button>

        <!-- Delete Button -->
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
          :aria-label="t('eventlist.delete')"
          @click="onDelete(item)"
        >
          <Trash2 class="w-5 h-5 text-red-600" />
        </button>
      </div>
    </div>

    <!-- Empty list message -->
    <p
      v-if="events.length === 0"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t("eventlist.noEventsFound") }}
    </p>
  </div>
</template>

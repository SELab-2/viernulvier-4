<script setup lang="ts">
/**
 * A reusable event list component, displays events in a card-style list, includes:
 *  - Rendering one EventListItem per event (for scalability and separation of concerns)
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
import type { EventWithDetails } from "../../types/EventWithDetails";

type Id = number | string;

type EventListItem = EventWithDetails & {
  productionTitle: string;
};

interface Props {
  events: EventListItem[];
}

defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", event: EventListItem): void;
  (e: "delete", payload: { id: Id; title: string }): void;
}>();

const { t } = useI18n();

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
    <EventListItem
      v-for="item in events"
      :key="item.id"
      :item="item"
      @edit="onEdit"
      @delete="onDelete"
    />

    <!-- Empty list message -->
    <p
      v-if="events.length === 0"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t("eventlist.noEventsFound") }}
    </p>
  </div>
</template>

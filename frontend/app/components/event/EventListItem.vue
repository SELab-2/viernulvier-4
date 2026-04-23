<script setup lang="ts">
/**
 * A reusable event list item component, displays one event card, includes:
 *  - Production title, location, date/time and prices per event
 *  - Edit action that emits the full event item
 *  - Delete action that emits the full event item
 *
 * This component is presentational. Confirmation and navigation are handled by EventListView.
 *
 * Usage:
 * <EventListItem
 *   :item="event"
 *   @edit="onEdit"
 *   @delete="onDelete"
 * />
 */
import type { EventWithDetails } from "../../types/EventWithDetails";
import {
  formatDateShort,
  formatTime,
  formatPrice,
} from "../../utils/formatters";

type EventListItem = EventWithDetails & {
  productionTitle: string;
};

interface Props {
  item: EventListItem;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: "edit", event: EventListItem): void;
  (e: "delete", event: EventListItem): void;
}>();

const { t, locale } = useI18n();

// function to get the price text for an event
const getPricesText = (event: EventWithDetails) => {
  if (!event.prices.length) return "-";
  return event.prices
    .map((price) => `${price.name}: ${formatPrice(price.price, locale.value)}`)
    .join(" | ");
};
</script>

<template>
  <div
    class="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
  >
    <!-- Event details -->
    <div class="flex-1 min-w-0">
      <h3 class="font-bold text-lg truncate">
        {{ item.productionTitle || "Unknown Production" }}
      </h3>
      <p class="text-xs text-gray-500 uppercase tracking-widest truncate">
        {{ item.location.location }} -
        {{
          formatDateShort(item.starttime, locale, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        }},
        {{ formatTime(item.starttime, locale) }}
      </p>
      <p class="text-xs font-bold mt-1">
        {{ t("eventlist.price") }}: {{ getPricesText(item) }}
      </p>
    </div>

    <div class="flex gap-2 ml-auto items-center">
      <AdminEditButton
        :label="t('eventlist.edit')"
        :size="44"
        @click="emit('edit', item)"
      />
      <AdminDeleteButton
        :label="t('eventlist.delete')"
        :size="44"
        @click="emit('delete', item)"
      />
    </div>
  </div>
</template>

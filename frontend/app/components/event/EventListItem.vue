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
import { Edit2, Trash2 } from "lucide-vue-next";
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

// Shared style constants
const buttonBaseClass =
  "w-11 h-11 p-0 flex items-center justify-center rounded-md border-2 transition-colors duration-150";

type ActionButtonColor = "blue" | "red";

const actionButtonVariants: Record<ActionButtonColor, string> = {
  blue: "border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900",
  red: "border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900",
};

// Icon size constant
const iconSize = 20;

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
      <!-- Edit Button -->
      <button
        type="button"
        :class="`${buttonBaseClass} ${actionButtonVariants.blue}`"
        :aria-label="t('eventlist.edit')"
        @click="emit('edit', item)"
      >
        <Edit2 :size="iconSize" />
      </button>

      <!-- Delete Button -->
      <button
        type="button"
        :class="`${buttonBaseClass} ${actionButtonVariants.red}`"
        :aria-label="t('eventlist.delete')"
        @click="emit('delete', item)"
      >
        <Trash2 :size="iconSize" />
      </button>
    </div>
  </div>
</template>

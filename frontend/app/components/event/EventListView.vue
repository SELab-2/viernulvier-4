<script setup lang="ts">
import { Edit2, Trash2 } from "lucide-vue-next";
import type { EventWithDetails } from "../../types/EventWithDetails";

type Id = number | string;

type EventListItem = EventWithDetails & {
  productionTitle: string;
};

interface Props {
  events: EventListItem[];
  emptyText?: string;
  priceLabel?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "edit", eventId: Id): void;
  (e: "delete", payload: { id: Id; title: string }): void;
}>();

const { locale } = useI18n();

const resolvedEmptyText = computed(() => {
  if (props.emptyText) return props.emptyText;
  return locale.value === "nl" ? "Geen events gevonden" : "No events found";
});

const resolvedPriceLabel = computed(() => {
  if (props.priceLabel) return props.priceLabel;
  return locale.value === "nl" ? "Prijs" : "Price";
});

const formatDateTime = (input: string | Date) => {
  const value = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(value.getTime())) return "Invalid date";
  return value.toLocaleString(locale.value);
};

const getVenue = (event: EventWithDetails) => {
  return event.locations[0]?.location ?? "Unknown Venue";
};

const getPrice = (event: EventWithDetails) => {
  const mainPrice = event.prices[0];
  if (!mainPrice) return "-";
  return `${mainPrice.name}: EUR ${mainPrice.price}`;
};

const onDelete = (item: EventListItem) => {
  emit("delete", {
    id: item.id,
    title: item.productionTitle || "Unknown Production",
  });
};
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="item in events"
      :key="item.id"
      class="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4"
    >
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-lg truncate">
          {{ item.productionTitle || "Unknown Production" }}
        </h3>
        <p class="text-xs text-gray-500 uppercase tracking-widest truncate">
          {{ getVenue(item) }} - {{ formatDateTime(item.starttime) }}
        </p>
        <p class="text-xs font-bold mt-1">
          {{ resolvedPriceLabel }}: {{ getPrice(item) }}
        </p>
      </div>

      <div class="flex gap-2 ml-auto items-center">
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :aria-label="locale === 'nl' ? 'Bewerk' : 'Edit'"
          @click="emit('edit', item.id)"
        >
          <Edit2 class="w-5 h-5" />
        </button>

        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
          :aria-label="locale === 'nl' ? 'Wis' : 'Delete'"
          @click="onDelete(item)"
        >
          <Trash2 class="w-5 h-5 text-red-600" />
        </button>
      </div>
    </div>

    <p
      v-if="events.length === 0"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ resolvedEmptyText }}
    </p>
  </div>
</template>

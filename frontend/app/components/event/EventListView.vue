<script setup lang="ts">
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
  (e: "edit", eventId: Id): void;
  (e: "delete", payload: { id: Id; title: string }): void;
}>();

const { t, locale } = useI18n();

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString(locale.value, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const getVenue = (event: EventWithDetails) => {
  return event.locations[0]?.location ?? "Unknown Venue";
};

const getPricesText = (event: EventWithDetails) => {
  if (!event.prices.length) return "-";
  return event.prices
    .map((price) => `${price.name}: ${formatPrice(price.price)}`)
    .join(" | ");
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
          {{ getVenue(item) }} - {{ formatDate(item.starttime) }},
          {{ formatTime(item.starttime) }}
        </p>
        <p class="text-xs font-bold mt-1">
          {{ t("eventlist.price") }}: {{ getPricesText(item) }}
        </p>
      </div>

      <div class="flex gap-2 ml-auto items-center">
        <button
          type="button"
          class="w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :aria-label="t('eventlist.edit')"
          @click="emit('edit', item.id)"
        >
          <Edit2 class="w-5 h-5" />
        </button>

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

    <p
      v-if="events.length === 0"
      class="text-center text-gray-500 dark:text-gray-400"
    >
      {{ t("eventlist.noEventsFound") }}
    </p>
  </div>
</template>

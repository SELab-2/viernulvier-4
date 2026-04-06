<script setup lang="ts">
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

const buttonBaseClass =
  "w-11 h-11 flex items-center justify-center rounded-full p-0 border border-gray-200 dark:border-gray-800 transition-colors";
const iconSize = 20;

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
      <button
        type="button"
        :class="`${buttonBaseClass} hover:bg-gray-100 dark:hover:bg-gray-800`"
        :aria-label="t('eventlist.edit')"
        @click="emit('edit', item)"
      >
        <Edit2 :size="iconSize" />
      </button>

      <button
        type="button"
        :class="`${buttonBaseClass} hover:bg-red-50 dark:hover:bg-red-900`"
        :aria-label="t('eventlist.delete')"
        @click="emit('delete', item)"
      >
        <Trash2 :size="iconSize" class="text-red-600" />
      </button>
    </div>
  </div>
</template>

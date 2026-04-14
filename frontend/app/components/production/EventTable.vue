<script setup lang="ts">
/**
 * A reusable event table component, displays events belonging to a specific production in a table, includes:
 *  - Time, location, price displayed per event
 *  - Scrollable when there are more than 3 events
 *
 * Usage:
 * <EventTable
 *    :events="events"
 * />
 *
 * Example events:
 * const events: EventWithDetails[] = [
 *    { id: 1, starttime: "2026-03-10T19:30:00Z", endtime: null, doors_at: null, intermission_at: null, created_at: "2026-03-10T00:00:00Z", updated_at: "2026-03-10T00:00:00Z", production_id: 1, location: { id: 1, location: "Antwerpen", created_at: "2026-03-10T00:00:00Z", updated_at: "2026-03-10T00:00:00Z" }, prices: [{ id: 1, price: 15.00, name: "Volwassenen", created_at: "2026-03-10T00:00:00Z", updated_at: "2026-03-10T00:00:00Z" }] },
 *    { id: 2, starttime: "2026-03-29T19:30:00Z", endtime: null, doors_at: null, intermission_at: null, created_at: "2026-03-29T00:00:00Z", updated_at: "2026-03-29T00:00:00Z", production_id: 1, location: { id: 2, location: "Gent", created_at: "2026-03-29T00:00:00Z", updated_at: "2026-03-29T00:00:00Z" }, prices: [{ id: 2, price: 12.50, name: "Volwassenen", created_at: "2026-03-29T00:00:00Z", updated_at: "2026-03-29T00:00:00Z" }] }
 * ]
 * For multiple prices, just add to the list.
 */

import { ref, computed } from "vue";
import type { EventWithDetails } from "../../types/EventWithDetails";
import {
  CalendarDays,
  MapPin,
  Euro,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-vue-next";

const { t, locale } = useI18n();

interface Props {
  events: EventWithDetails[];
  limit?: number;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 5,
});

const isExpanded = ref(false);

/**
 * Logica voor het tonen van de events
 */
const visibleEvents = computed(() => {
  if (isExpanded.value || props.events.length <= props.limit) {
    return props.events;
  }
  return props.events.slice(0, props.limit);
});

const hasHiddenEvents = computed(() => props.events.length > props.limit);

// Formatter functies
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
  });
};

//TODO: doors_at? intermission_at?

const formatPrice = (price: number) => {
  return new Intl.NumberFormat(locale.value, {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const expandedPriceIds = ref(new Set<number>());

const togglePrices = (id: number) => {
  if (expandedPriceIds.value.has(id)) {
    expandedPriceIds.value.delete(id);
  } else {
    expandedPriceIds.value.add(id);
  }
};

// Styling constanten
const headerWide = "text-left p-4 w-[40%] align-middle";
const headerNarrow = "text-left p-4 w-[20%] align-middle";
const headerIcon = "flex items-center gap-1.5";
const headerIconSize = 13;
const cellWide = "p-4 text-sm w-[40%] max-w-0";
const cellNarrow = "p-4 text-sm w-[20%] max-w-0";
</script>
<template>
  <div class="w-full">
    <div
      v-if="events.length"
      class="overflow-hidden rounded-lg border-[1.5px] border-gray-900 dark:border-white/20 bg-card"
    >
      <table class="w-full border-collapse">
        <thead>
          <tr
            class="bg-gray-900 dark:bg-white/10 text-white dark:text-foreground text-[11px] font-brand font-black uppercase tracking-widest align-middle"
          >
            <th :class="headerWide">
              <span :class="headerIcon"
                ><CalendarDays :size="headerIconSize" />{{
                  t("production.dateAndTime")
                }}</span
              >
            </th>
            <th :class="headerWide">
              <span :class="headerIcon"
                ><MapPin :size="headerIconSize" />{{
                  t("production.location")
                }}</span
              >
            </th>
            <th :class="headerNarrow">
              <span :class="headerIcon"
                ><Euro :size="headerIconSize" />{{
                  t("production.price")
                }}</span
              >
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-for="event in visibleEvents" :key="event.id">
            <tr
              class="group relative border-t-2 border-gray-900/10 dark:border-white/10"
            >
              <td :class="cellWide" class="relative">
                <p
                  class="font-brand font-black text-sm uppercase tracking-tight truncate"
                >
                  {{ formatDate(event.starttime) }}
                </p>
                <p
                  class="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 truncate"
                >
                  <Clock :size="10" class="shrink-0" />{{
                    formatTime(event.starttime)
                  }}
                </p>
              </td>

              <td :class="cellWide">
                <p class="text-sm truncate font-medium">
                  {{ event.location?.location || "-" }}
                </p>
              </td>

              <td :class="cellNarrow">
                <div v-if="event.prices && event.prices.length">
                  <p class="text-sm font-brand font-black tracking-tight">
                    {{ formatPrice(event.prices[0]?.price || 0) }}
                  </p>

                  <button
                    v-if="event.prices.length > 1"
                    @click.stop="togglePrices(event.id)"
                    class="text-[10px] uppercase font-black text-muted-foreground mt-1 hover:underline flex items-center gap-1"
                  >
                    {{
                      expandedPriceIds.has(event.id)
                        ? t("production.hidePriceDetails")
                        : t("production.showExtraPrices", {
                            count: event.prices.length - 1,
                          })
                    }}
                  </button>
                </div>
                <p v-else class="text-sm text-muted-foreground opacity-30">—</p>
              </td>
            </tr>

            <tr
              v-if="expandedPriceIds.has(event.id)"
              class="bg-gray-50 dark:bg-white/5"
            >
              <td
                colspan="3"
                class="px-8 py-6 border-t border-gray-900/5 dark:border-white/5"
              >
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-12">
                  <div
                    v-for="p in event.prices"
                    :key="p.id"
                    class="flex flex-col border-l-2 border-accent pl-4"
                  >
                    <span
                      class="text-[9px] uppercase font-black text-muted-foreground/60 leading-tight mb-1 tracking-widest"
                    >
                      {{ p.name }}
                    </span>
                    <span class="text-sm font-brand font-black">
                      {{ formatPrice(p.price) }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <button
        v-if="hasHiddenEvents"
        @click="isExpanded = !isExpanded"
        class="w-full py-4 t text-accent hover:bg-card-hover border-t-2 border-border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[2px] transition-all"
      >
        <template v-if="!isExpanded">
          {{ t("general.showMore") }} ({{ events.length - limit }})
          <ChevronDown :size="14" stroke-width="3" />
        </template>
        <template v-else>
          {{ t("general.showLess") }}
          <ChevronUp :size="14" stroke-width="3" />
        </template>
      </button>
    </div>
  </div>
</template>

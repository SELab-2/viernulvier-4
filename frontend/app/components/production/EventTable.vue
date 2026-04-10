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
 *    { id: 1, starttime: '2026-03-10T19:30:00Z', endtime: null, doors_at: null, intermission_at: null, created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z', production_id: 1, location: { id: 1, location: 'Antwerpen', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' }, prices: [{ id: 1, price: 15.00, name: 'Volwassenen', created_at: '2026-03-10T00:00:00Z', updated_at: '2026-03-10T00:00:00Z' }] },
 *    { id: 2, starttime: '2026-03-29T19:30:00Z', endtime: null, doors_at: null, intermission_at: null, created_at: '2026-03-29T00:00:00Z', updated_at: '2026-03-29T00:00:00Z', production_id: 1, location: { id: 2, location: 'Gent', created_at: '2026-03-29T00:00:00Z', updated_at: '2026-03-29T00:00:00Z' }, prices: [{ id: 2, price: 12.50, name: 'Volwassenen', created_at: '2026-03-29T00:00:00Z', updated_at: '2026-03-29T00:00:00Z' }] }
 * ]
 *
 * For multiple prices, just add to the list.
 */

import type { EventWithDetails } from "../../types/EventWithDetails";
const { t, locale } = useI18n();
import { CalendarDays, MapPin, Euro, Clock } from "lucide-vue-next";
import {
  formatDateShort,
  formatTime,
  formatPrice,
} from "../../utils/formatters";

interface Props {
  events: EventWithDetails[];
}
defineProps<Props>();

// constants
const headerWide = "text-left p-4 w-[40%] align-middle";
const headerNarrow = "text-left p-4 w-[20%] align-middle";
const headerIcon = "flex items-center gap-1.5";
const headerIconSize = 13;
const cellWide = "p-4 text-[12px] w-[40%] max-w-0";
const cellNarrow = "p-4 text-[12px] w-[20%] max-w-0";
</script>

<template>
  <div class="m-4">
    <!-- Title -->
    <h3 class="text-[12px] font-bold uppercase mb-2">
      {{ t("production.events") }}
    </h3>

    <div
      v-if="events.length"
      class="overflow-hidden rounded-lg border border-border"
    >
      <div class="overflow-y-auto max-h-[20rem]">
        <table class="w-full">
          <!-- Header -->
          <thead class="sticky top-0 z-10">
            <tr
              class="bg-foreground/90 dark:bg-background text-background dark:text-foreground text-[11px] font-brand font-black uppercase tracking-widest align-middle"
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

          <!-- Body -->
          <tbody>
            <tr
              v-for="event in events"
              :key="event.id"
              class="group relative border-t border-border bg-card hover:bg-card-hover transition-colors duration-150 cursor-pointer"
            >
              <!-- Date -->
              <td :class="cellWide" class="relative">
                <div
                  class="absolute left-0 top-0 bottom-0 w-[3px] bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  aria-hidden="true"
                />
                <p
                  class="font-brand font-black text-[12px] uppercase tracking-tight truncate group-hover:text-accent transition-colors duration-150"
                >
                  {{
                    formatDateShort(event.starttime, locale, {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  }}
                </p>
                <p
                  class="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 truncate"
                >
                  <Clock :size="10" class="shrink-0" />{{
                    formatTime(event.starttime, locale)
                  }}
                </p>
              </td>

              <!-- Location -->
              <td :class="cellWide">
                <p class="text-[12px] truncate">
                  {{ event.location?.location || "-" }}
                </p>
              </td>

              <!-- Price -->
              <td :class="cellNarrow">
                <p
                  v-for="p in event.prices"
                  :key="p.id"
                  class="text-[12px] truncate"
                >
                  <span class="text-muted-foreground text-[10px]">{{
                    p.name
                  }}</span
                  ><br />
                  <span class="font-brand font-black">{{
                    formatPrice(p.price, locale)
                  }}</span>
                </p>
                <p
                  v-if="!event.prices.length"
                  class="text-[12px] text-muted-foreground"
                >
                  —
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty table -->
    <div
      v-else
      class="rounded-lg border border-border bg-card p-4 text-[12px] text-muted-foreground"
    >
      {{ t("production.noEvents") }}
    </div>
  </div>
</template>

<style scoped></style>

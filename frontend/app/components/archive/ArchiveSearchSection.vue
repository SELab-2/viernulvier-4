<!--
ArchiveSearchSection.vue

Top control section for the archive page.
Responsible for:
- Managing search input, filters, and view mode
- Toggling and rendering the filter panel
- Handling tag, date, and sorting filters
- Fetching and setting the oldest available date for the calendar

Uses:
- useArchiveView: shared archive state (filters, view mode, etc.)
- useProductionApi / useEventApi: to derive oldest available date
- Calendar: date range filtering UI
- TagFilter: tag selection UI

Modes:
- Public:
  search + filters + grid/list toggle

- Admin:
  search + filters only
  forced list view
-->
<script setup lang="ts">
import { LayoutGrid, List, X } from "lucide-vue-next";
import { useArchiveView } from "../../composables/useArchiveView";
import Calendar from "~/components/DefaultCalendar.vue";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import type { ProductionView, Event } from "@repo/common";
import TagFilter from "./TagFilter.vue";
import { getToday } from "~/utils/constants";

const props = withDefaults(
  defineProps<{
    isAdmin?: boolean;
  }>(),
  {
    isAdmin: false,
  },
);

const { t, locale } = useI18n();

const {
  viewMode,
  searchQuery,
  sortOrder,
  dateFilter,
  oldestDate,
  tagIds,
  fetchSuggestions,
} = useArchiveView();

const { getAll: getAllProductions } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();

const filterOpen = ref(false);
const calendarKey = ref(0);

// Check if any filter is currently active (used for "clear filters" button)
const hasActiveFilters = computed(() => {
  return (
    tagIds.value.length > 0 ||
    !!dateFilter.value.after ||
    dateFilter.value.before !== getToday() // Checks whether the before date is custom or not.
  );
});

function clearAllFilters() {
  // Reset all filters to default state
  tagIds.value = [];
  dateFilter.value = {};
  // Force calendar component to re-render/reset
  calendarKey.value++;
}

async function fetchOldestDate() {
  try {
    const resp = await getAllProductions({
      paginationFilters: { page: 0, limit: 1, descending: false },
      languageFilters: { lang: locale.value as "nl" | "en" },
    });

    const first = resp.data?.objects?.[0] as ProductionView | undefined;
    if (!first?.id) return;

    const evResp = await getAllEvents({
      eventFilters: { production_id: first.id as any },
    });

    const events: Event[] = Array.isArray((evResp.data as any)?.objects)
      ? (evResp.data as any).objects
      : Array.isArray(evResp.data)
        ? (evResp.data as any)
        : [];

    // Extract all timestamps and find earliest
    const times = events
      .flatMap((e) => [e.starttime, e.endtime])
      .filter(Boolean)
      .map((t) => Date.parse(t!))
      .filter((t) => !Number.isNaN(t));

    if (times.length) {
      oldestDate.value = new Date(Math.min(...times))
        .toISOString()
        .slice(0, 10);
    }
  } catch {
    // Non-critical: calendar still works without the oldest date
  }
}

onMounted(() => {
  if (props.isAdmin) {
    viewMode.value = "list";
  }

  fetchOldestDate();
});
</script>

<template>
  <div class="w-full border-b border-border bg-background">
    <!-- Toolbar row -->
    <div class="page-container py-5 flex items-stretch gap-3">
      <!-- Search -->
      <div class="flex-1 min-w-0 h-12">
        <SearchBar
          v-model="searchQuery"
          :fetch-suggestions="fetchSuggestions"
          :limit="15"
          :scroll-limit="5"
          :placeholder="t('archive.search_placeholder')"
        />
      </div>

      <!-- Filter toggle + badge -->
      <div class="relative">
        <button
          type="button"
          :class="[
            'btn-outline h-12 px-5 gap-2 shrink-0 flex items-center justify-center',
            filterOpen && '!bg-foreground !text-background !border-foreground',
          ]"
          :aria-expanded="filterOpen"
          @click="filterOpen = !filterOpen"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 2h10L7 6.5V10.5L5 9.5V6.5L1 2z"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ t("general.filters") }}</span>
        </button>

        <!-- Clear filters badge -->
        <button
          v-if="hasActiveFilters"
          @click.stop="clearAllFilters"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition shadow-sm"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- Public only: grid/list toggle -->
      <button
        v-if="!props.isAdmin"
        class="w-12 h-12 flex items-center justify-center rounded-md border-2 border-foreground bg-transparent text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
      >
        <List v-if="viewMode === 'grid'" class="w-4 h-4" />
        <LayoutGrid v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Filter panel -->
    <Transition name="filter-slide">
      <div v-if="filterOpen" class="border-t border-border">
        <div class="page-container py-6 flex flex-col gap-6">
          <!-- Sort order -->
          <div class="flex flex-col gap-2 shrink-0 pt-1 w-max">
            <span
              class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
            >
              {{ t("archive.sortLabel") }}
            </span>
            <select
              v-model="sortOrder"
              class="h-10 px-3 rounded-md bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 w-max"
            >
              <option value="newest">{{ t("archive.sortNewest") }}</option>
              <option value="oldest">{{ t("archive.sortOldest") }}</option>
            </select>
          </div>

          <!-- Calendar -->
          <span
            class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            {{ t("archive.calendarLabel") }}
          </span>
          <div class="min-w-0">
            <Calendar
              :key="calendarKey"
              :oldest-date="oldestDate"
              :model-filter="dateFilter"
              @update:filter="dateFilter = $event"
            />
          </div>

          <!-- Tag filter -->
          <span
            class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            {{ t("archive.tagsLabel") }}
          </span>
          <TagFilter />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.filter-slide-enter-active,
.filter-slide-leave-active {
  transition:
    opacity 0.18s ease,
    max-height 0.22s ease;
  overflow: hidden;
  max-height: 900px;
}
.filter-slide-enter-from,
.filter-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>

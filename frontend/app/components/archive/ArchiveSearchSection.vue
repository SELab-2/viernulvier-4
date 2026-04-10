<script setup lang="ts">
import { LayoutGrid, List } from "lucide-vue-next";
import { useArchiveView } from "../../composables/useArchiveView";
import Calendar from "~/components/DefaultCalendar.vue";
import { useProductionApi } from "~/composables/useProductionApi";
import { useEventApi } from "~/composables/useEventApi";
import type { ProductionView, Event } from "@repo/common";
import TagFilter from "./TagFilter.vue";
import { X } from "lucide-vue-next";

const { t, locale } = useI18n();

const { viewMode, searchQuery, sortOrder, dateFilter, oldestDate, tagIds } =
  useArchiveView();

const { getAll: getAllProductions } = useProductionApi();
const { getAll: getAllEvents } = useEventApi();

const filterOpen = ref(false);
const calendarKey = ref(0);

const hasDateFilter = computed(
  () => !!(dateFilter.value.after || dateFilter.value.before),
);

const hasActiveFilters = computed(() => {
  return (
    tagIds.value.length > 0 ||
    !!dateFilter.value.after ||
    !!dateFilter.value.before
  );
});

function clearAllFilters() {
  tagIds.value = [];
  dateFilter.value = {};
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
    /* non-critical */
  }
}

onMounted(fetchOldestDate);
</script>

<template>
  <div class="w-full border-b border-border bg-background">
    <!-- Toolbar row -->
    <div class="max-w-5xl mx-auto px-4 py-6 flex items-center gap-4">
      <!-- Search -->
      <div class="flex-1 h-12">
        <SearchBar
          v-model="searchQuery"
          :items="[]"
          :placeholder="t('archive.search_placeholder')"
        />
      </div>

      <!-- Filter toggle + badge -->
      <div class="relative">
        <button
          :class="['btn-outline h-12 px-4']"
          :aria-expanded="filterOpen"
          @click="filterOpen = !filterOpen"
        >
          {{ t("archive.filter") }}
        </button>

        <!-- Clear filters badge -->
        <button
          v-if="hasActiveFilters"
          @click.stop="clearAllFilters"
          class="absolute -top-2.25 -right-2.25 w-5.5 h-5.5 rounded-full flex items-center justify-center border border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition shadow-sm"
        >
          <X class="w-3 h-3" />
        </button>
      </div>

      <!-- View toggle -->
      <button
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
        <div class="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
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

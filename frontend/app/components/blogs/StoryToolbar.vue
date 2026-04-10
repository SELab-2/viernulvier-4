<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Toolbar row + in-flow filter panel.

  The panel opens below the toolbar (in flow), pushing <main> down.
  It contains two sections:
    1. Year multiselect  — derived from oldestDate/newestDate backend bounds.
       Multiple years = union mapped to a single before/after range
       (min-year Jan 1 → max-year Dec 31).
    2. Calendar          — fine-grained date picking.
  Using one clears the other.
-->
<script lang="ts" setup>
import type { FilterBlog } from "@repo/common";
import Calendar from "~/components/DefaultCalendar.vue";

const props = defineProps<{
  storyTitles: string[];
  oldestDate:  string;
  newestDate:  string;
  dateFilter:  FilterBlog;
}>();

const emit = defineEmits<{
  (e: "update:search",     query:  string):     void;
  (e: "update:dateFilter", filter: FilterBlog): void;
}>();

const sortOrder = defineModel<"newest" | "oldest">("sortOrder", { required: true });
const { t }     = useI18n();

const searchQuery   = ref("");
const panelOpen     = ref(false);
const selectedYear  = ref<number | null>(null);

watch(searchQuery, (val) => emit("update:search", val));

// Year range
const years = computed<number[]>(() => {
  if (!props.oldestDate || !props.newestDate) return [];
  const start = new Date(props.oldestDate).getFullYear();
  const end   = new Date(props.newestDate).getFullYear();
  const arr: number[] = [];
  for (let y = end; y >= start; y--) arr.push(y);  // newest first
  return arr;
});

function toggleYear(year: number) {
  selectedYear.value = selectedYear.value === year ? null : year;

  if (selectedYear.value === null) {
    emit("update:dateFilter", {});
  } else {
    emit("update:dateFilter", {
      after:  `${year}-01-01`,
      before: `${year}-12-31`,
    });
  }
}

function clearYears() {
  selectedYear.value = null;
  emit("update:dateFilter", {});
}

// Calendar pick clears year selection
function onCalendarFilter(filter: FilterBlog) {
  selectedYear.value = null;
  emit("update:dateFilter", filter);
}

// External clear (e.g. route change) syncs back
watch(() => props.dateFilter, (f) => {
  if (!f.after && !f.before) selectedYear.value = null;
}, { deep: true });

// Active state
const hasDateFilter  = computed(() => !!(props.dateFilter.after || props.dateFilter.before));
const hasYearFilter  = computed(() => selectedYear.value !== null);
const filterIsActive = computed(() => panelOpen.value || hasDateFilter.value);
</script>

<template>
  <div class="border-b border-border bg-background">

    <!-- Toolbar row -->
    <div class="container mx-auto px-4 max-w-5xl py-5 flex items-stretch gap-3">

      <!-- Search -->
      <div class="flex-1 min-w-0 h-10">
        <SearchBar
          v-model="searchQuery"
          :items="storyTitles"
          :limit="6"
          :scroll-limit="4"
          :placeholder="t('stories.searchPlaceholder')"
        />
      </div>

      <!-- Filters toggle -->
      <button
        type="button"
        :class="[
          'btn-outline h-10 gap-2 shrink-0 relative',
          filterIsActive && '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
        ]"
        :aria-expanded="panelOpen"
        :aria-label="t('stories.filters.toggle')"
        @click="panelOpen = !panelOpen"
      >
        <!-- Funnel icon -->
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M1 2h10L7 6.5V10.5L5 9.5V6.5L1 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
        <span>{{ t('stories.filters.toggle') }}</span>
        <!-- Active dot when filter is on but panel is closed -->
        <span
          v-if="hasDateFilter && !panelOpen"
          class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500"
          aria-hidden="true"
        />
      </button>

      <!-- Sort -->
      <select
        v-model="sortOrder"
        class="h-10 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 shrink-0 self-center"
      >
        <option value="newest">{{ t("stories.sortNewest") }}</option>
        <option value="oldest">{{ t("stories.sortOldest") }}</option>
      </select>

    </div>

    <!-- Filter panel — in flow, pushes content down -->
    <Transition name="cal-slide">
      <div v-if="panelOpen" class="border-t border-border">
        <div class="container mx-auto px-4 max-w-5xl py-5 flex flex-col sm:flex-row gap-6">

          <!-- Year picker -->
          <div class="sm:w-44 shrink-0 flex flex-col gap-2">
            <div class="flex items-center justify-between mb-1">
              <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {{ t('stories.filters.year') }}
              </span>
              <button
                v-if="hasYearFilter"
                type="button"
                class="font-brand font-black text-[9px] uppercase tracking-widest text-purple-500 hover:text-purple-400 transition-colors"
                @click="clearYears"
              >
                {{ t('stories.filters.clear') }}
              </button>
            </div>

            <!--
              Scrollable list: max ~6 items visible (~192px),
              scrolls when the year range is long.
            -->
            <div class="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              <label
                v-for="year in years"
                :key="year"
                class="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer select-none
                       hover:bg-muted transition-colors group"
              >
                <input
                  type="radio"
                  name="year-filter"
                  class="accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                  :checked="selectedYear === year"
                  @change="toggleYear(year)"
                />
                <span
                  class="font-brand font-black text-[11px] uppercase tracking-widest transition-colors"
                  :class="selectedYear === year ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'"
                >
                  {{ year }}
                </span>
              </label>

              <div
                v-if="years.length === 0"
                class="px-2 py-1.5 font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground/50"
              >
                —
              </div>
            </div>

            <!-- Summary of active year -->
            <p
              v-if="selectedYear"
              class="font-brand font-black text-[9px] uppercase tracking-widest text-purple-500 mt-1 px-1"
            >
              {{ selectedYear }}
            </p>
          </div>

          <!-- Divider -->
          <div class="hidden sm:block w-px bg-border self-stretch" aria-hidden="true" />
          <div class="block sm:hidden h-px w-full bg-border" aria-hidden="true" />

          <!-- Calendar -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-3">
              <span class="font-brand font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                {{ t('stories.filters.dateRange') }}
              </span>
            </div>
            <Calendar
              :oldest-date="oldestDate"
              :model-filter="dateFilter"
              @update:filter="onCalendarFilter"
            />
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.cal-slide-enter-active,
.cal-slide-leave-active {
  transition: opacity 0.18s ease, max-height 0.25s ease;
  overflow: hidden;
  max-height: 700px;
}
.cal-slide-enter-from,
.cal-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Thin scrollbar for year list */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}
.scrollbar-thin::-webkit-scrollbar       { width: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
</style>
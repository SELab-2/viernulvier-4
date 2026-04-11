<!--
  components/blogs/StoryToolbar.vue
  ===================================
  Toolbar row + in-flow filter panel.

  The panel opens below the toolbar (in flow), pushing <main> down.
  It contains two sections:
    1. Year picker       — derived from oldestDate/newestDate backend bounds.
       Clicking a year filters to that year; clicking again deselects.
    2. Calendar          — fine-grained date picking.
  Using one clears the other.
-->
<script lang="ts" setup>
import { isoYear } from "~/utils/formatters";
import type { FilterBlog } from "@repo/common";

const props = defineProps<{
  storyTitles: string[];
  oldestDate: string;
  newestDate: string;
  dateFilter: FilterBlog;
}>();

const emit = defineEmits<{
  (e: "update:search", query: string): void;
  (e: "update:dateFilter", filter: FilterBlog): void;
}>();

const sortOrder = defineModel<"newest" | "oldest">("sortOrder", {
  required: true,
});
const { t } = useI18n();

const searchQuery = ref("");
const panelOpen = ref(false);
const selectedYear = ref<number | null>(null);
const calendarKey = ref(0);

watch(searchQuery, (val) => emit("update:search", val));

// Year range
const years = computed<number[]>(() => {
  if (!props.oldestDate || !props.newestDate) return [];
  const start = isoYear(props.oldestDate);
  const end = isoYear(props.newestDate);
  const arr: number[] = [];
  for (let y = end; y >= start; y--) arr.push(y);
  return arr;
});

function toggleYear(year: number) {
  if (selectedYear.value === year) {
    selectedYear.value = null;
    emit("update:dateFilter", {});
  } else {
    selectedYear.value = year;
    emit("update:dateFilter", {
      after: `${year}-01-01`,
      before: `${year}-12-31`,
    });
  }
}

function clearYears() {
  selectedYear.value = null;
  emit("update:dateFilter", {});
}

// Calendar pick clears year selection and resets calendar internal state
function onCalendarFilter(filter: FilterBlog) {
  selectedYear.value = null;
  emit("update:dateFilter", filter);
}

function clearAllFilters() {
  selectedYear.value = null;
  calendarKey.value++;
  emit("update:dateFilter", {});
}

watch(
  () => props.dateFilter,
  (f) => {
    if (!f.after && !f.before) {
      selectedYear.value = null;
      return;
    }
    const isFullYear =
      f.after?.endsWith("-01-01") &&
      f.before?.endsWith("-12-31") &&
      f.after.substring(0, 4) === f.before.substring(0, 4);
    if (!isFullYear) {
      selectedYear.value = null;
    }
  },
  { deep: true },
);

// Active state
const hasDateFilter = computed(
  () => !!(props.dateFilter.after || props.dateFilter.before),
);
const hasYearFilter = computed(() => selectedYear.value !== null);
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
      <div class="relative">
        <button
          type="button"
          :class="[
            'btn-outline h-10 gap-2 shrink-0',
            filterIsActive &&
              '!bg-[var(--foreground)] !text-[var(--background)] !border-[var(--foreground)]',
          ]"
          :aria-expanded="panelOpen"
          :aria-label="t('stories.filters.toggle')"
          @click="panelOpen = !panelOpen"
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
          <span>{{ t("stories.filters.toggle") }}</span>
        </button>

        <!-- Clear badge — visible when filter active but panel closed -->
        <button
          v-if="hasDateFilter && !panelOpen"
          class="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center border border-[var(--blog-purple-strong)] bg-[var(--blog-purple-ghost)] text-[var(--blog-purple-strong)] hover:bg-[var(--blog-purple-strong)] hover:text-white transition shadow-sm"
          @click.stop="clearAllFilters"
          :aria-label="t('stories.filters.clear')"
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1l6 6M7 1L1 7"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Filter panel — vertical layout, matches archive -->
    <Transition name="cal-slide">
      <div v-if="panelOpen" class="border-t border-border">
        <div class="container mx-auto px-4 max-w-5xl py-6 flex flex-col gap-6">
          <!-- Sort order -->
          <div class="flex flex-col gap-2 w-max">
            <span class="section-label">{{ t("stories.sortLabel") }}</span>
            <select
              v-model="sortOrder"
              class="h-10 px-3 rounded bg-muted border border-border text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground focus:outline-none cursor-pointer transition-colors hover:border-foreground/30 w-max"
            >
              <option value="newest">{{ t("stories.sortNewest") }}</option>
              <option value="oldest">{{ t("stories.sortOldest") }}</option>
            </select>
          </div>

          <!-- Year picker -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="section-label">{{ t("stories.filters.year") }}</span>
              <button
                v-if="hasYearFilter"
                type="button"
                class="year-clear-inline"
                @click="clearYears"
              >
                {{ selectedYear }} · {{ t("stories.filters.clear") }}
              </button>
            </div>

            <!-- Horizontal pill row -->
            <div class="year-pills">
              <button
                v-for="year in years"
                :key="year"
                type="button"
                class="year-pill"
                :data-selected="selectedYear === year ? true : undefined"
                @click="toggleYear(year)"
              >
                {{ year }}
              </button>
              <div v-if="years.length === 0" class="year-empty">—</div>
            </div>
          </div>

          <!-- Calendar -->
          <div class="flex flex-col gap-2">
            <span class="section-label">{{
              t("stories.filters.dateRange")
            }}</span>
            <DefaultCalendar
              :key="calendarKey"
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
  transition:
    opacity 0.18s ease,
    max-height 0.25s ease;
  overflow: hidden;
  max-height: 900px;
}
.cal-slide-enter-from,
.cal-slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Section label — matches archive style */
.section-label {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
}

/* ── Year pills (horizontal) ── */
.year-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.year-pill {
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  transition: all 0.12s;
}
.year-pill:hover {
  border-color: var(--blog-purple-strong);
  background: var(--blog-purple-ghost);
  color: var(--blog-purple-strong);
}
.year-pill[data-selected] {
  border-color: var(--blog-purple-strong);
  background: var(--blog-purple-strong);
  color: #fff;
}

/* Inline clear next to section label */
.year-clear-inline {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--blog-purple-strong);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.12s;
}
.year-clear-inline:hover {
  background: var(--blog-purple-ghost);
}

.year-empty {
  font-family: var(--font-brand, "ABCMonumentGrotesk", sans-serif);
  font-weight: 900;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-foreground);
  opacity: 0.5;
}
</style>

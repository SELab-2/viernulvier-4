<script setup lang="ts">
/**
 * SeriesForm.vue
 *
 * List wrapper for series items.
 * - Search bar to find and link existing series (uses is_suggestion filter).
 * - Renders existing (linked) and new series as editable rows.
 * - Linked series can be edited (titel/description) in place.
 * - Parent provides modelValue (ProductionSeriesForm) and receives updates via v-model.
 * - Handles link/unlink/create/edit and collapse/expand UI.
 */

import { ref, computed, watch } from "vue";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Link,
  Loader2,
  X,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import type {
  ProductionSeriesForm,
  ExistingSeries,
  NewSeries,
} from "~/composables/productions/steps/productionSeries";
import type { SeriesView } from "@repo/common";

import SeriesItemEditor from "./SeriesItemEditor.vue";

const props = defineProps<{
  modelValue: ProductionSeriesForm;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ProductionSeriesForm): void;
}>();

const { t } = useI18n();
const seriesApi = useSeriesApi();

// ─── Search state ────────────────────────────────────────────────────────────

const searchQuery = ref("");
const searchResults = ref<SeriesView[]>([]);
const isSearching = ref(false);
const showDropdown = ref(false);
// IDs already in the draft (to filter out from search results)
const linkedIds = computed(
  () =>
    new Set(
      props.modelValue
        .filter((s): s is ExistingSeries => s.type === "existing")
        .map((s) => s.id),
    ),
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val.trim()) {
    searchResults.value = [];
    showDropdown.value = false;
    return;
  }
  debounceTimer = setTimeout(() => doSearch(val.trim()), 300);
});

async function doSearch(query: string) {
  isSearching.value = true;
  showDropdown.value = true;
  try {
    const res = await seriesApi.getAll({
      languageFilters: { lang: "nl" },
      seriesFilters: { title: query, is_suggestion: true },
    });
    searchResults.value =
      (res.data as unknown as { objects?: SeriesView[] })?.objects ?? [];
  } catch {
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

// Filter out already-linked items from dropdown
const filteredResults = computed(() =>
  searchResults.value.filter((s) => !linkedIds.value.has(s.id)),
);

// Link an existing series from the search dropdown
function linkSeries(series: SeriesView) {
  const newItem: ExistingSeries = {
    type: "existing",
    id: series.id,
    titel: { nl: series.titel as string, en: undefined },
    description: { nl: (series.description as string) ?? "", en: undefined },
  };
  emit("update:modelValue", [...props.modelValue, newItem]);
  // Clearing the query triggers the watcher which resets searchResults + showDropdown
  searchQuery.value = "";
}

// Clearing the query triggers the watcher which resets searchResults + showDropdown
function clearSearch() {
  searchQuery.value = "";
}

// ─── Model helpers ────────────────────────────────────────────────────────────

function addNewSeries() {
  const newItem: NewSeries = {
    type: "new",
    titel: { nl: "", en: undefined },
    description: { nl: "", en: undefined },
  };
  emit("update:modelValue", [...props.modelValue, newItem]);
  // New items start expanded by default (absent from collapsedItems)
}

function updateItem(index: number, item: ExistingSeries | NewSeries) {
  const next = [...props.modelValue];
  next[index] = item;
  emit("update:modelValue", next);
}

function deleteItem(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  emit("update:modelValue", next);
  // Rebuild collapsed set — remove deleted index, shift down higher ones
  const updated = new Set<number>();
  for (const i of collapsedItems.value) {
    if (i < index) updated.add(i);
    else if (i > index) updated.add(i - 1);
    // i === index is dropped
  }
  collapsedItems.value = updated;
}

// ─── Collapse state ───────────────────────────────────────────────────────────

// Items start expanded by default (not in collapsedItems set).
const collapsedItems = ref<Set<number>>(new Set());

function toggleCollapse(index: number) {
  const next = new Set(collapsedItems.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedItems.value = next;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

function itemLabel(item: ExistingSeries | NewSeries): string {
  return item.titel.nl?.trim() || t("admin-productions.series.new");
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <!-- Header -->
    <div
      class="flex items-center justify-between border-b border-border px-6 py-4"
    >
      <div>
        <p
          class="text-[11px] font-black uppercase tracking-widest text-foreground"
        >
          {{ t("admin-productions.steps.series") }}
        </p>
        <p class="mt-0.5 text-[10px] text-muted-foreground">
          {{ t("admin-productions.series.hint") }}
        </p>
      </div>

      <!-- Create new series button -->
      <button
        class="flex h-8 items-center gap-2 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
        @click="addNewSeries"
      >
        <Plus :size="11" stroke-width="3" />
        {{ t("admin-productions.series.add") }}
      </button>
    </div>

    <!-- Search bar to link existing series -->
    <div class="relative border-b border-border px-6 py-3">
      <div class="relative flex items-center">
        <Search
          :size="13"
          class="pointer-events-none absolute left-3 text-muted-foreground"
        />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="t('admin-productions.series.search-placeholder')"
          class="h-9 w-full rounded-md border border-border bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/20"
          @focus="showDropdown = searchResults.length > 0"
        />
        <button
          v-if="searchQuery"
          class="absolute right-2 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          @click="clearSearch"
        >
          <X :size="12" />
        </button>
      </div>

      <!-- Dropdown results -->
      <div
        v-if="showDropdown"
        class="absolute left-6 right-6 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <!-- Loading -->
        <div
          v-if="isSearching"
          class="flex items-center gap-2 px-4 py-3 text-[11px] text-muted-foreground"
        >
          <Loader2 :size="12" class="animate-spin" />
          {{ t("common.loading", "Searching…") }}
        </div>

        <!-- No results -->
        <div
          v-else-if="
            filteredResults.length === 0 && !isSearching && searchQuery
          "
          class="px-4 py-3 text-[11px] text-muted-foreground"
        >
          {{ t("admin-productions.series.no-results") }}
        </div>

        <!-- Results list -->
        <ul v-else class="max-h-52 divide-y divide-border overflow-y-auto">
          <li
            v-for="result in filteredResults"
            :key="result.id"
            class="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted"
            @mousedown.prevent="linkSeries(result)"
          >
            <div class="min-w-0">
              <p class="truncate text-[11px] font-semibold text-foreground">
                {{ result.titel }}
              </p>
              <p
                v-if="result.description"
                class="truncate text-[10px] text-muted-foreground"
              >
                {{ result.description }}
              </p>
            </div>
            <div
              class="ml-3 flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-accent"
            >
              <Link :size="10" />
              {{ t("admin-productions.series.link") }}
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Series list -->
    <div v-if="modelValue.length > 0" class="divide-y divide-border">
      <div
        v-for="(item, index) in props.modelValue"
        :key="`${item.type}-${item.type === 'existing' ? item.id : index}`"
      >
        <!-- Row header -->
        <div
          class="flex cursor-pointer items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
          @click="toggleCollapse(index)"
        >
          <div class="flex min-w-0 flex-col gap-0.5">
            <p
              class="truncate text-[11px] font-black uppercase tracking-widest text-foreground"
            >
              {{ itemLabel(item) }}
            </p>
            <p
              v-if="item.type === 'existing'"
              class="text-[9px] text-muted-foreground"
            >
              ID: {{ item.id }}
            </p>
          </div>

          <div class="ml-4 flex shrink-0 items-center gap-2">
            <!-- Badge: new or linked -->
            <span
              v-if="item.type === 'new'"
              class="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
            >
              {{ t("admin-productions.series.new") }}
            </span>
            <span
              v-else
              class="rounded-full bg-foreground/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {{ t("admin-productions.series.linked") }}
            </span>

            <!-- Delete / unlink -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
              :title="
                item.type === 'existing'
                  ? t('admin-productions.series.unlink')
                  : t('admin-productions.series.delete')
              "
              @click.stop="deleteItem(index)"
            >
              <Trash2 :size="11" stroke-width="2.5" />
            </button>

            <ChevronDown
              v-if="collapsedItems.has(index)"
              :size="13"
              class="text-muted-foreground"
            />
            <ChevronUp v-else :size="13" class="text-muted-foreground" />
          </div>
        </div>

        <!-- Expanded editor — available for both new and existing series -->
        <div v-if="!collapsedItems.has(index)" class="px-6 pb-6 pt-2">
          <SeriesItemEditor
            :item="item"
            :index="index"
            @update="(updated) => updateItem(index, updated)"
          />
        </div>
      </div>
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center"
    >
      <div
        class="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-border bg-muted"
      >
        <Plus :size="16" class="text-muted-foreground" />
      </div>
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.series.none") }}
        </p>
        <p class="mt-1 text-[10px] text-muted-foreground/60">
          {{ t("admin-productions.series.hint") }}
        </p>
      </div>
    </div>
  </div>
</template>

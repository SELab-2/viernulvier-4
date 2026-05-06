<!--
  components/admin/productions/SeriesSelector.vue

  Step 4: Series linking.
  Fully local — no API calls until finish().

  Features:
  - Search through existing series
  - Select / deselect one or more series
  - Create a new series inline (stored locally with isNew flag)
  - Reset to original selection (edit mode)
  - Emits @change with full SeriesItem[] on every change
  - Emits @reset when reset button is clicked

  NOTE: The series API is not yet available. The component is fully wired
  visually and emits the right data. The actual API calls in finish() are
  marked with TODO placeholders in useProductionForm.
-->
<script setup lang="ts">
import type { SeriesItem } from "~/composables/productions/useProductionForm";
import { Search, Plus, X, RotateCcw } from "lucide-vue-next";

const props = defineProps<{
  selected: SeriesItem[];
  mode: "create" | "edit";
}>();

const emit = defineEmits<{
  change: [SeriesItem[]];
  reset: [];
}>();

const { t } = useI18n();

// ─── Mock available series (replace with API call when available) ─────────────
// TODO: replace with useSeriesApi().getAll() when the API is ready
const availableSeries = ref<SeriesItem[]>([]);
const isLoading = ref(false);

// ─── Search ───────────────────────────────────────────────────────────────────
const searchQuery = ref("");

const filteredSeries = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return availableSeries.value;
  return availableSeries.value.filter((s) => s.name.toLowerCase().includes(q));
});

const showCreateOption = computed(() => {
  const q = searchQuery.value.trim();
  if (!q) return false;
  const exists = availableSeries.value.some(
    (s) => s.name.toLowerCase() === q.toLowerCase(),
  );
  const alreadyNew = props.selected.some(
    (s) => s.isNew && s.name.toLowerCase() === q.toLowerCase(),
  );
  return !exists && !alreadyNew;
});

// ─── Select / deselect ───────────────────────────────────────────────────────
function toggle(series: SeriesItem) {
  const current = [...props.selected];
  const idx = current.findIndex((s) => s.id === series.id);
  if (idx === -1) {
    emit("change", [...current, { ...series }]);
  } else {
    current.splice(idx, 1);
    emit("change", current);
  }
}

const isSelected = (id: number) => props.selected.some((s) => s.id === id);

// ─── Create new series (local) ───────────────────────────────────────────────
function createNew() {
  const name = searchQuery.value.trim();
  if (!name) return;
  const tempId = -Date.now();
  emit("change", [...props.selected, { id: tempId, name, isNew: true }]);
  searchQuery.value = "";
}

function removeNew(id: number) {
  emit(
    "change",
    props.selected.filter((s) => s.id !== id),
  );
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <p
        class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {{ t("admin.productions.series.title", "Series") }}
      </p>
      <button
        v-if="mode === 'edit'"
        class="flex items-center gap-1.5 h-7 px-3 rounded-lg border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
        @click="emit('reset')"
      >
        <RotateCcw :size="10" stroke-width="3" />
        {{ t("admin.productions.reset", "Reset") }}
      </button>
    </div>

    <!-- Search input -->
    <div class="relative">
      <Search
        :size="14"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        v-model="searchQuery"
        class="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm outline-none focus:border-accent transition-colors placeholder:text-muted-foreground/50"
        :placeholder="
          t(
            'admin.productions.series.searchPlaceholder',
            'Search or create a series…',
          )
        "
        @keydown.enter="showCreateOption ? createNew() : undefined"
      />
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-wrap gap-2">
      <div
        v-for="i in 4"
        :key="i"
        class="h-10 rounded-xl bg-muted animate-pulse"
        :style="{ width: `${120 + i * 30}px` }"
      />
    </div>

    <template v-else>
      <!-- Available series list -->
      <div
        v-if="filteredSeries.length > 0"
        class="space-y-1.5 max-h-60 overflow-y-auto pr-1"
      >
        <button
          v-for="series in filteredSeries"
          :key="series.id"
          class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left"
          :class="
            isSelected(series.id)
              ? 'bg-accent/10 border-accent text-foreground'
              : 'bg-background border-border hover:border-accent/50 text-foreground'
          "
          @click="toggle(series)"
        >
          <span class="text-sm font-medium">{{ series.name }}</span>
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
            :class="
              isSelected(series.id)
                ? 'border-accent bg-accent'
                : 'border-border'
            "
          >
            <div
              v-if="isSelected(series.id)"
              class="w-1.5 h-1.5 rounded-full bg-white"
            />
          </div>
        </button>
      </div>

      <!-- Empty search state -->
      <div
        v-else-if="!showCreateOption && searchQuery"
        class="py-8 text-center"
      >
        <p class="text-sm text-muted-foreground">
          {{ t("admin.productions.series.noResults", "No series found") }}
        </p>
      </div>

      <!-- Empty (no series exist yet) -->
      <div
        v-else-if="!showCreateOption && availableSeries.length === 0"
        class="py-8 text-center border-2 border-dashed border-border rounded-xl"
      >
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
        >
          {{
            t(
              "admin.productions.series.empty",
              "No series yet — create the first one",
            )
          }}
        </p>
      </div>

      <!-- Create new series option -->
      <button
        v-if="showCreateOption"
        class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-accent/50 bg-accent/5 hover:bg-accent/10 transition-all text-left"
        @click="createNew"
      >
        <div
          class="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0"
        >
          <Plus :size="12" stroke-width="3" class="text-accent" />
        </div>
        <div>
          <p class="text-sm font-semibold text-foreground">
            "{{ searchQuery }}"
          </p>
          <p
            class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ t("admin.productions.series.createNew", "Create new series") }}
          </p>
        </div>
      </button>

      <!-- New series pending creation -->
      <div
        v-if="selected.some((s) => s.isNew)"
        class="pt-2 border-t border-border"
      >
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2"
        >
          {{
            t(
              "admin.productions.series.newSeries",
              "New series (will be created on finish)",
            )
          }}
        </p>
        <div class="space-y-1.5">
          <div
            v-for="series in selected.filter((s) => s.isNew)"
            :key="series.id"
            class="flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-accent/50 bg-accent/5"
          >
            <span class="text-sm font-medium text-foreground">{{
              series.name
            }}</span>
            <button
              class="w-5 h-5 rounded-full hover:bg-accent/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              @click="removeNew(series.id)"
            >
              <X :size="10" stroke-width="3" />
            </button>
          </div>
        </div>
      </div>

      <!-- Selection summary -->
      <div
        v-if="selected.length > 0"
        class="flex items-center justify-between pt-1"
      >
        <p
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ selected.length }}
          {{ t("admin.productions.series.selected", "selected") }}
        </p>
        <button
          class="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          @click="emit('change', [])"
        >
          {{ t("archive.clear_tags", "Clear all") }}
        </button>
      </div>
    </template>
  </div>
</template>

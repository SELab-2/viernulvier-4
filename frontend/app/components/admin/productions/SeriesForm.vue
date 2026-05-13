<script setup lang="ts">
/**
 * SeriesForm.vue
 *
 * List wrapper for series items.
 * - Renders existing and new series as rows.
 * - Parent provides modelValue (ProductionSeriesForm) and receives updates via v-model.
 * - Handles add/delete and collapse/expand UI; the SeriesItemEditor handles editing fields.
 *
 * UX notes:
 * - The row header displays the primary NL title and ID (if existing).
 * - The "New" badge and delete control live at the row level to avoid duplicated controls.
 */

import { ref, computed } from "vue";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import type {
  ProductionSeriesForm,
  ExistingSeries,
  NewSeries,
} from "~/composables/productions/steps/productionSeries";

// local child component import
import SeriesItemEditor from "./SeriesItemEditor.vue";

const props = defineProps<{
  modelValue: ProductionSeriesForm;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: ProductionSeriesForm): void;
}>();

const { t } = useI18n();

// Emit updated model
function update(value: ProductionSeriesForm) {
  emit("update:modelValue", value);
}

// Add a new blank series (user action)
function addSeries() {
  const newItem: NewSeries = {
    type: "new",
    titel: { nl: "", en: undefined },
    description: { nl: "", en: undefined },
  };
  update([...props.modelValue, newItem]);
}

// Update or delete helpers
function updateItem(index: number, item: ExistingSeries | NewSeries) {
  const next = [...props.modelValue];
  next[index] = item;
  update(next);
}

function deleteItem(index: number) {
  const next = [...props.modelValue];
  next.splice(index, 1);
  update(next);
}

// Track collapsed/expanded rows (by index)
const collapsedItems = ref<Set<number>>(new Set());
function toggleCollapse(index: number) {
  const next = new Set(collapsedItems.value);
  if (next.has(index)) next.delete(index);
  else next.add(index);
  collapsedItems.value = next;
}

const hasItems = computed(() => props.modelValue.length > 0);
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-border bg-card">
    <div
      class="flex items-center justify-between border-b border-border px-6 py-4"
    >
      <div>
        <p
          class="text-[11px] font-black uppercase tracking-widest text-foreground"
        >
          {{ t("admin-productions.series.title", "Series") }}
        </p>
        <p class="mt-0.5 text-[10px] text-muted-foreground">
          {{
            t(
              "admin-productions.series.hint",
              "Manage series for this production",
            )
          }}
        </p>
      </div>

      <button
        class="flex h-8 items-center gap-2 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
        @click="addSeries"
      >
        <Plus :size="11" stroke-width="3" />
        {{ t("admin-productions.series.add", "Add series") }}
      </button>
    </div>

    <div v-if="hasItems" class="divide-y divide-border">
      <div v-for="(item, index) in props.modelValue" :key="index">
        <!-- Row header: label, optional ID, delete + expand controls -->
        <div
          class="flex cursor-pointer items-center justify-between px-6 py-3 transition-colors hover:bg-muted"
          @click="toggleCollapse(index)"
        >
          <div class="flex min-w-0 flex-col gap-0.5">
            <p
              class="truncate text-[11px] font-black uppercase tracking-widest text-foreground"
            >
              {{
                item.type === "existing"
                  ? item.titel.nl
                  : t("admin-productions.series.new", "New")
              }}
            </p>
            <p
              v-if="item.type === 'existing'"
              class="text-[9px] text-muted-foreground"
            >
              ID: {{ (item as ExistingSeries).id }}
            </p>
          </div>

          <div class="ml-4 flex shrink-0 items-center gap-2">
            <span
              v-if="item.type === 'new'"
              class="rounded-full bg-accent/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-accent"
            >
              {{ t("admin-productions.series.new", "New") }}
            </span>

            <!-- Row-level delete (single delete control for clarity) -->
            <button
              class="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-action-red-border hover:bg-action-red-hover hover:text-action-red-icon"
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

        <!-- Expanded editor -->
        <div v-if="!collapsedItems.has(index)" class="px-6 pb-6 pt-2">
          <SeriesItemEditor
            :item="item"
            :index="index"
            @update="(updated) => updateItem(index, updated)"
          />
        </div>
      </div>
    </div>

    <!-- Empty placeholder -->
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
          {{ t("admin-productions.series.none", "No series yet") }}
        </p>
        <p class="mt-1 text-[10px] text-muted-foreground/60">
          {{
            t(
              "admin-productions.series.hint",
              "Manage series for this production",
            )
          }}
        </p>
      </div>
    </div>
  </div>
</template>

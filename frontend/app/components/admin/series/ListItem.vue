<script setup lang="ts">
/**
 * components/admin/series/ListItem.vue
 *
 * A single row in the admin series list.
 * - Shows summary info (title, ID).
 * - Expands to show the editor and linking tools.
 */

import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Layers,
  Save,
  Loader2,
} from "lucide-vue-next";
import type { Series } from "@repo/common";
import type { ExistingSeries } from "~/composables/productions/steps/productionSeries";

const props = defineProps<{
  series: Series;
  isExpanded: boolean;
  isSaving?: boolean;
  isDeleting?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
  (e: "delete"): void;
  (e: "save", data: { id: number; titel: any; description: any }): void;
  (e: "batchEdit"): void;
}>();

const { t } = useI18n();

// Helper to ensure we have a localized object structure
function normalizeLocalized(val: any): { nl: string; en?: string } {
  if (!val) return { nl: "", en: "" };
  if (typeof val === "string") return { nl: val, en: "" };
  return {
    nl: val.nl || "",
    en: val.en || "",
  };
}

// Internal draft for the editor component
const draft = ref<ExistingSeries>({
  type: "existing",
  id: props.series.id,
  titel: normalizeLocalized(props.series.titel),
  description: normalizeLocalized(props.series.description),
});

watch(
  () => props.series,
  (newSeries) => {
    draft.value = {
      type: "existing",
      id: newSeries.id,
      titel: normalizeLocalized(newSeries.titel),
      description: normalizeLocalized(newSeries.description),
    };
  },
  { deep: true },
);

function handleUpdate(updated: any) {
  draft.value = updated;
}

function onSave() {
  emit("save", {
    id: draft.value.id,
    titel: draft.value.titel,
    description: draft.value.description,
  });
}
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-border bg-card transition-all"
    :class="
      isExpanded
        ? 'ring-2 ring-primary/20 border-primary/30 shadow-lg'
        : 'hover:border-primary/30'
    "
  >
    <!-- Row Header -->
    <div
      class="flex cursor-pointer items-center justify-between px-6 py-4"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-4 min-w-0">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        >
          <Layers :size="18" />
        </div>
        <div class="min-w-0">
          <h4
            class="truncate text-sm font-black uppercase tracking-tight text-foreground italic"
          >
            {{ series.titel.nl || "Untitled Series" }}
          </h4>
          <p
            class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
          >
            ID: {{ series.id }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Quick Action: Batch Edit -->
        <button
          class="hidden sm:flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
          @click.stop="emit('batchEdit')"
        >
          <Layers :size="12" />
          {{ t("admin-productions.batch.proceed") }}
        </button>

        <div
          class="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors"
          :class="
            isExpanded
              ? 'bg-primary text-primary-foreground border-primary'
              : 'hover:border-primary/30 hover:text-foreground'
          "
        >
          <ChevronDown v-if="!isExpanded" :size="16" />
          <ChevronUp v-else :size="16" />
        </div>
      </div>
    </div>

    <!-- Expanded Content -->
    <div
      v-if="isExpanded"
      class="border-t border-border bg-muted/30 p-6 space-y-8"
    >
      <!-- Editor Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3
            class="text-[11px] font-black uppercase tracking-widest text-foreground"
          >
            {{ t("admin-productions.steps.series") }} Details
          </h3>
          <div class="flex gap-2">
            <button
              class="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-[10px] font-black uppercase tracking-widest text-destructive transition-colors hover:bg-destructive hover:text-white"
              :disabled="isDeleting"
              @click="emit('delete')"
            >
              <Trash2 v-if="!isDeleting" :size="12" />
              <Loader2 v-else :size="12" class="animate-spin" />
              {{ t("general.delete") }}
            </button>
            <button
              class="flex h-8 items-center gap-2 rounded-md bg-foreground px-4 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-80"
              :disabled="isSaving"
              @click="onSave"
            >
              <Save v-if="!isSaving" :size="12" />
              <Loader2 v-else :size="12" class="animate-spin" />
              {{ t("general.save") }}
            </button>
          </div>
        </div>

        <AdminProductionsSeriesItemEditor
          :item="draft"
          @update="handleUpdate"
        />
      </div>

      <!-- Link to Production Section -->
      <!-- Using the abstracted production-linker -->
      <AdminSharedProductionLinker type="series" :entity-id="series.id" />

      <!-- Final Action -->
      <div class="pt-4 border-t border-border flex justify-end">
        <button
          class="flex h-10 items-center gap-2 rounded-lg bg-accent px-6 text-[11px] font-black uppercase tracking-widest text-white transition-opacity hover:opacity-80"
          @click="emit('batchEdit')"
        >
          <Layers :size="14" />
          {{ t("admin-productions.batch.proceed") }}
        </button>
      </div>
    </div>
  </div>
</template>

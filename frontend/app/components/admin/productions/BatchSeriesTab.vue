<!--
  components/admin/productions/batch/BatchSeriesTab.vue

  Series tab for the batch edit page.

  - On mount: the page already called loadCommonSeries, so this tab just renders.
  - Pre-selected series are those common to ALL selected productions.
  - The user edits via the existing SeriesForm component (same as single-production flow).
  - Reset: restores the draft to the last loaded server state.
  - Save: applies the diff (connect / disconnect / create / update) to every
    selected production individually via the existing API, then reloads.
  - While saving: an overlay prevents interaction.
-->
<script setup lang="ts">
import { computed } from "vue";
import { Loader2, RotateCcw, Save } from "lucide-vue-next";
import SeriesForm from "~/components/admin/productions/SeriesForm.vue";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import type { LocalizedInput } from "~/composables/productions/steps/productionSeries";

const props = defineProps<{
  fetchSeriesForProduction: (
    id: number,
  ) => Promise<
    import("~/composables/productions/steps/productionSeries").ExistingSeries[]
  >;
}>();

const { t } = useI18n();
const seriesApi = useSeriesApi();

const {
  selectedProductions,
  commonSeriesLoaded,
  seriesDraft,
  loadCommonSeries,
  setSeriesDraft,
  resetSeriesDraft,
  extractSeriesPayload,
} = useProductionBatchEdit();

const isSaving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);

// A computed copy ensures SeriesForm receives a new array reference whenever
// seriesDraft changes (reset, load, save). Mirrors the fix used in BatchTagsTab.
const seriesForForm = computed(() => [...seriesDraft.value]);

// Re-fetch when the selection changes (triggered by page on every mount).
// Also re-fetch on locale change so series labels stay up to date.
const { locale } = useI18n();
watch(locale, () => loadCommonSeries(props.fetchSeriesForProduction));

// ── Helpers mirrored from useProductionFormPage ───────────────────────────────

function toModifySeriesPayload(input: {
  titel: LocalizedInput;
  description: LocalizedInput;
}) {
  return {
    titel: { nl: input.titel.nl, en: input.titel.en ?? input.titel.nl },
    description: {
      nl: input.description.nl,
      en: input.description.en ?? input.description.nl,
    },
  };
}

// ── Save ──────────────────────────────────────────────────────────────────────

/**
 * Save flow — mirrors useProductionFormPage's handleSeriesEdit + handleSeriesUpdate
 * applied to every selected production:
 *
 *   1. Create brand-new series → collect returned ids.
 *   2. For every selected production: connect + disconnect series.
 *   3. Update field edits on existing series (shared, so only needs to run once).
 *   4. Reload from server so baseline = last saved state.
 */
async function save() {
  if (isSaving.value) return;

  isSaving.value = true;
  saveError.value = null;
  saveSuccess.value = false;

  const payload = extractSeriesPayload();
  const hasChanges =
    payload.connect.length > 0 ||
    payload.disconnect.length > 0 ||
    payload.create.length > 0 ||
    payload.update.length > 0;

  if (!hasChanges) {
    isSaving.value = false;
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 800);
    return;
  }

  try {
    // Step 1 — create brand-new series, collect their server-assigned ids.
    const newSeriesIds = await Promise.all(
      payload.create.map(async (s) => {
        const created = await seriesApi.create(s);
        if (!created.data)
          throw new Error(`Failed to create series: ${s.titel.nl}`);
        return created.data.id;
      }),
    );

    const idsToConnect = [...payload.connect, ...newSeriesIds];

    // Step 2 — apply connect + disconnect to every selected production.
    await Promise.all(
      selectedProductions.value.flatMap((production) => [
        ...idsToConnect.map((seriesId) =>
          seriesApi.linkProductionToSeries(seriesId, [production.id]),
        ),
        ...payload.disconnect.map((seriesId) =>
          seriesApi.unlinkProductionFromSeries(seriesId, production.id),
        ),
      ]),
    );

    // Step 3 — update field edits on existing series.
    // Series are shared entities, so this only needs to run once (not per production).
    await Promise.all(
      payload.update.map((s) =>
        seriesApi.modify(s.id, toModifySeriesPayload(s)),
      ),
    );

    // Step 4 — reload from server so baseline = saved state and reset works correctly.
    await loadCommonSeries(props.fetchSeriesForProduction);

    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 800);
  } catch (err) {
    console.error("Batch series save failed", err);
    saveError.value = t(
      "admin-productions.batchEdit.series.saveError",
      "Something went wrong while saving. Please try again.",
    );
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header row -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <p
          class="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin-productions.batchEdit.series.title", "Series") }}
        </p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{
            t(
              "admin-productions.batchEdit.series.description",
              "Pre-linked series are common to all selected productions. Changes apply to every production on save.",
            )
          }}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Reset -->
        <button
          class="h-8 px-3 rounded-full border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="isSaving || !commonSeriesLoaded"
          @click="resetSeriesDraft"
        >
          <RotateCcw :size="10" stroke-width="2.5" />
          {{ t("common.reset", "Reset") }}
        </button>

        <!-- Save -->
        <button
          class="h-8 px-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          :class="
            saveSuccess
              ? 'bg-green-500 text-white border border-green-500'
              : 'bg-accent text-accent-foreground border border-accent hover:opacity-90'
          "
          :disabled="isSaving || !commonSeriesLoaded"
          @click="save"
        >
          <Loader2
            v-if="isSaving"
            :size="10"
            stroke-width="2.5"
            class="animate-spin"
          />
          <Save v-else :size="10" stroke-width="2.5" />
          {{
            saveSuccess
              ? t("common.saved", "Saved!")
              : isSaving
                ? t("common.saving", "Saving…")
                : t("common.save", "Save")
          }}
        </button>
      </div>
    </div>

    <!-- Common-series notice -->
    <p
      v-if="commonSeriesLoaded && selectedProductions.length > 1"
      class="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
    >
      {{
        t(
          "admin-productions.batchEdit.series.commonNotice",
          { count: selectedProductions.length },
          `Showing series common to all ${selectedProductions.length} selected productions.`,
        )
      }}
    </p>

    <!-- Loading skeleton -->
    <div v-if="!commonSeriesLoaded" class="flex flex-col gap-3">
      <div class="h-12 rounded-xl bg-muted animate-pulse" />
      <div class="h-12 rounded-xl bg-muted animate-pulse opacity-70" />
      <div class="h-12 rounded-xl bg-muted animate-pulse opacity-40" />
    </div>

    <!-- Series form + saving overlay -->
    <div v-else class="relative">
      <!-- Saving overlay -->
      <Transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isSaving"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-background/80 backdrop-blur-sm"
        >
          <Loader2
            :size="22"
            stroke-width="2"
            class="animate-spin text-accent"
          />
          <p
            class="text-[9px] font-black uppercase tracking-widest text-muted-foreground"
          >
            {{ t("common.saving", "Saving…") }}
          </p>
        </div>
      </Transition>

      <SeriesForm
        :model-value="seriesForForm"
        @update:model-value="setSeriesDraft"
      />
    </div>

    <!-- Error -->
    <p
      v-if="saveError"
      class="text-[9px] font-black uppercase tracking-widest text-destructive"
    >
      {{ saveError }}
    </p>
  </div>
</template>

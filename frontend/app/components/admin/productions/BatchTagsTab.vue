<!--
  components/admin/productions/batch/BatchTagsTab.vue

  The page (ProductionBatchEditPage) owns the initial load and passes
  fetchTagsForProduction down as a prop. This tab uses it only for:
    - reloading after a successful save
    - re-fetching when the locale changes

  This removes the onMounted / commonTagsLoaded race condition that caused
  tags to sometimes not appear after navigating back to the page.
-->
<script setup lang="ts">
import { Loader2, RotateCcw, Save } from "lucide-vue-next";
import TagSelector from "~/components/admin/productions/TagSelector.vue";
import { useProductionBatchEdit } from "~/composables/productions/useProductionBatchEdit";
import type { ProductionTagItem } from "~/composables/productions/steps/productionTags";

const props = defineProps<{
  fetchTagsForProduction: (
    id: number,
  ) => Promise<{ id: number; tag: string }[]>;
}>();

const { t, locale } = useI18n();
const productionApi = useProductionApi();
const tagApi = useTagApi();

const {
  selectedProductions,
  commonTagsLoaded,
  tagsDraft,
  loadCommonTags,
  setTagsDraft,
  resetTagsDraft,
  extractTagsPayload,
} = useProductionBatchEdit();

const isSaving = ref(false);
const saveError = ref<string | null>(null);
const saveSuccess = ref(false);

// Re-fetch when locale changes so tag labels update.
watch(locale, () => loadCommonTags(props.fetchTagsForProduction));

// ── Save ──────────────────────────────────────────────────────────────────────

async function save() {
  if (isSaving.value) return;

  isSaving.value = true;
  saveError.value = null;
  saveSuccess.value = false;

  const payload = extractTagsPayload();
  const hasChanges =
    payload.connect.length > 0 ||
    payload.disconnect.length > 0 ||
    payload.create.length > 0;

  if (!hasChanges) {
    isSaving.value = false;
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2500);
    return;
  }

  try {
    // Step 1 — persist brand-new tags and collect their server-assigned ids.
    const newTagIds = await Promise.all(
      payload.create.map(async (label) => {
        const created = await tagApi.create({ tag: { nl: label, en: label } });
        if (!created.data) throw new Error(`Failed to create tag: ${label}`);
        return created.data.id;
      }),
    );

    const idsToConnect = [...payload.connect, ...newTagIds];

    // Step 2 — apply the diff to every selected production.
    await Promise.all(
      selectedProductions.value.flatMap((production) => [
        ...idsToConnect.map((tagId) =>
          productionApi.addTag(production.id, tagId),
        ),
        ...payload.disconnect.map((tagId) =>
          productionApi.removeTag(production.id, tagId),
        ),
      ]),
    );

    // Step 3 — reload from the server so baseline = last saved state,
    // meaning reset after a save correctly restores to what was persisted.
    await loadCommonTags(props.fetchTagsForProduction);

    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2500);
  } catch (err) {
    console.error("Batch tag save failed", err);
    saveError.value = t(
      "admin-productions.batchEdit.tags.saveError",
      "Something went wrong while saving. Please try again.",
    );
  } finally {
    isSaving.value = false;
  }
}

function handleTagChange(items: ProductionTagItem[]) {
  setTagsDraft(items);
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
          {{ t("admin-productions.batchEdit.tags.title", "Tags") }}
        </p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{
            t(
              "admin-productions.batchEdit.tags.description",
              "Pre-selected tags are shared by all selected productions. Changes apply to every production on save.",
            )
          }}
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Reset -->
        <button
          class="h-8 px-3 rounded-full border border-border text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="isSaving || !commonTagsLoaded"
          @click="resetTagsDraft"
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
          :disabled="isSaving || !commonTagsLoaded"
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

    <!-- Common-tags notice -->
    <p
      v-if="commonTagsLoaded && selectedProductions.length > 1"
      class="text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 rounded-lg px-3 py-2"
    >
      {{
        t(
          "admin-productions.batchEdit.tags.commonNotice",
          { count: selectedProductions.length },
          `Showing tags common to all ${selectedProductions.length} selected productions.`,
        )
      }}
    </p>

    <!-- Loading skeleton -->
    <div v-if="!commonTagsLoaded" class="flex flex-wrap gap-2">
      <div
        v-for="i in 12"
        :key="i"
        class="h-8 rounded-full bg-muted animate-pulse"
        :style="{ width: `${60 + (i % 5) * 18}px` }"
      />
    </div>

    <!-- Tag selector + saving overlay -->
    <div v-else class="relative">
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

      <TagSelector :selected="tagsDraft" @change="handleTagChange" />
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

<!--
  components/admin/productions/FormPage.vue

  4-step production create/edit flow.
  All API calls are deferred until the Finish button on the last step.

  Steps:
    1 — Core info (NL required: titel, description1, description2)
    2 — Tags (local selection + inline create)
    3 — Media (visual placeholder, logic TBD)
    4 — Series (local selection + inline create, API TBD)

  Edit mode:
    - Changed fields are highlighted in the form
    - Per-step reset button restores original values
    - Only changed fields are sent in the PATCH

  Navigation:
    - Back/Cancel always goes to originPath (captured on mount, before any
      step navigation dirtied the history stack)
-->
<script setup lang="ts">
import {
  ChevronLeft,
  Check,
  Lock,
  RotateCcw,
  AlertCircle,
} from "lucide-vue-next";
import { useProductionForm } from "~/composables/productions/useProductionForm";

interface Props {
  mode: "create" | "edit";
}

const props = defineProps<Props>();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// ─── Capture origin ONCE before any step navigation ──────────────────────────
const originPath = ref("/admin/productions");
onMounted(() => {
  const prev = (router.options.history.state as any)?.back as string | null;
  if (prev && !prev.includes("step=")) {
    originPath.value = prev;
  }
});

function exitFlow() {
  router.push(originPath.value);
}

// ─── Step / ID from query ─────────────────────────────────────────────────────
const currentStep = computed(() => Number(route.query.step ?? "1"));

const routeParamId = computed(() => {
  if (props.mode !== "edit") return null;
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

const queryId = computed(() => {
  const raw = route.query.id;
  const n = parseInt((Array.isArray(raw) ? raw[0] : raw) ?? "", 10);
  return isFinite(n) ? n : null;
});

const resolvedId = computed(() => routeParamId.value ?? queryId.value);

// ─── Composable ──────────────────────────────────────────────────────────────
const {
  initialNl,
  initialEn,
  previewData,
  selectedTags,
  selectedSeries,
  isLoading,
  isSubmitting,
  submitErrors,
  step1ValidationError,
  changedNlFields,
  changedEnFields,
  existingId,
  handleNlUpdate,
  handleEnUpdate,
  resetStep,
  finish,
} = useProductionForm({
  mode: props.mode,
  productionId: resolvedId.value,
});

// ─── Step 1 local error (shown on "Next" click attempt) ───────────────────────
const showStep1Error = ref(false);

// ─── Steps ───────────────────────────────────────────────────────────────────
// All steps are always unlocked — user navigates freely once we have local state.
// (Steps 2-4 require step 1 to have valid data to be useful, but we don't lock
// them — the finish() validation catches missing required fields.)
const STEPS = computed(() => [
  { number: 1, label: t("admin.productions.steps.coreInfo", "Core info") },
  { number: 2, label: t("admin.productions.steps.tags", "Tags") },
  { number: 3, label: t("admin.productions.steps.media", "Media") },
  { number: 4, label: t("admin.productions.steps.series", "Series") },
]);

function goToStep(n: number) {
  router.push({
    query: {
      step: String(n),
      ...(resolvedId.value ? { id: String(resolvedId.value) } : {}),
    },
  });
}

function tryNextFromStep1() {
  if (step1ValidationError.value) {
    showStep1Error.value = true;
    return;
  }
  showStep1Error.value = false;
  goToStep(2);
}

// ─── Finish: runs all API calls then navigates away ───────────────────────────
async function handleFinish() {
  try {
    await finish();
    if (submitErrors.value.length === 0) {
      exitFlow();
    }
    // If there are non-fatal errors (e.g. a tag link failed) we stay and show them
  } catch {
    // Fatal error (e.g. production create failed) — submitErrors is populated
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- ── Sticky top bar ────────────────────────────────────────────────── -->
    <div
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div
        class="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4"
      >
        <!-- Exit -->
        <button
          class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0"
          @click="exitFlow"
        >
          <ChevronLeft :size="14" stroke-width="3" />
          {{ t("general.back", "Back") }}
        </button>

        <!-- Mode label -->
        <h1
          class="font-brand font-black uppercase tracking-tight text-sm italic shrink-0"
        >
          {{
            mode === "create"
              ? t("admin.productions.create.title", "New production")
              : t("admin.productions.edit.title", "Edit production")
          }}
        </h1>

        <!-- Step pills -->
        <div class="flex items-center gap-1 shrink-0">
          <template v-for="(step, i) in STEPS" :key="step.number">
            <div v-if="i > 0" class="w-5 h-px bg-border" />
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200"
              :class="
                currentStep === step.number
                  ? 'bg-foreground text-background'
                  : currentStep > step.number
                    ? 'bg-muted text-muted-foreground hover:text-foreground'
                    : 'bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground'
              "
              @click="goToStep(step.number)"
            >
              <Check
                v-if="currentStep > step.number"
                :size="10"
                stroke-width="3"
              />
              <span v-else class="w-3 text-center">{{ step.number }}</span>
              <span class="hidden sm:inline">{{ step.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ── Loading ───────────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-32 gap-4"
      >
        <div
          class="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin"
        />
        <p
          class="text-[11px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {{ t("admin.productions.edit.loading", "Loading production…") }}
        </p>
      </div>
    </Transition>

    <!-- ── Step content ───────────────────────────────────────────────────── -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      mode="out-in"
    >
      <div
        v-if="!isLoading"
        :key="currentStep"
        class="max-w-screen-xl mx-auto px-6 py-8"
      >
        <!-- ══════════════ STEP 1 — Core info ══════════════ -->
        <template v-if="currentStep === 1">
          <div class="flex gap-8 items-start">
            <div class="flex-1 min-w-0">
              <!-- Changed fields banner (edit mode) -->
              <Transition
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="
                    mode === 'edit' &&
                    (changedNlFields.size > 0 || changedEnFields.size > 0)
                  "
                  class="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                  <div class="flex items-center gap-2">
                    <AlertCircle :size="14" class="text-amber-500 shrink-0" />
                    <p
                      class="text-xs font-medium text-amber-700 dark:text-amber-400"
                    >
                      {{
                        t(
                          "admin.productions.edit.unsavedChanges",
                          "Unsaved changes",
                        )
                      }}
                      —
                      <span class="opacity-70">
                        {{
                          [...changedNlFields, ...changedEnFields]
                            .map((f) => f.replace("nl.", "").replace("en.", ""))
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .join(", ")
                        }}
                      </span>
                    </p>
                  </div>
                  <button
                    class="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:opacity-70 transition-opacity shrink-0"
                    @click="resetStep(1)"
                  >
                    <RotateCcw :size="10" stroke-width="3" />
                    {{ t("admin.productions.reset", "Reset") }}
                  </button>
                </div>
              </Transition>

              <AdminProductionsDualForm
                :liveUpdate="true"
                :initialNl="initialNl"
                :initialEn="initialEn"
                :changedNlFields="changedNlFields"
                :changedEnFields="changedEnFields"
                @nl-update="handleNlUpdate"
                @en-update="handleEnUpdate"
              />

              <!-- Validation error -->
              <Transition
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <p
                  v-if="showStep1Error && step1ValidationError"
                  class="mt-4 text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
                >
                  {{ step1ValidationError }}
                </p>
              </Transition>

              <div class="mt-6 flex items-center justify-between gap-4">
                <button
                  class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                  @click="exitFlow"
                >
                  {{ t("general.cancel", "Cancel") }}
                </button>
                <button
                  class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                  @click="tryNextFromStep1"
                >
                  {{ t("admin.productions.steps.next", "Next →") }}
                </button>
              </div>
            </div>

            <div
              class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
              >
                {{ t("admin.productions.preview.label", "Live preview") }}
              </p>
              <AdminProductionsPreview
                :data="previewData"
                :tags="selectedTags"
                :series="selectedSeries"
              />
            </div>
          </div>
        </template>

        <!-- ══════════════ STEP 2 — Tags ══════════════ -->
        <template v-else-if="currentStep === 2">
          <div class="flex gap-8 items-start">
            <div class="flex-1 min-w-0">
              <div class="mb-6">
                <h2
                  class="font-brand font-black uppercase italic tracking-tight text-xl mb-1"
                >
                  {{ t("admin.productions.steps.tags", "Tags") }}
                </h2>
                <p class="text-sm text-muted-foreground">
                  {{
                    t(
                      "admin.productions.tags.hint",
                      "Select the tags that apply. New tags will be created when you finish.",
                    )
                  }}
                </p>
              </div>

              <div class="border border-border rounded-xl p-6 bg-background">
                <AdminProductionsTagSelector
                  :selected="selectedTags"
                  :mode="props.mode"
                  @change="selectedTags = $event"
                  @reset="resetStep(2)"
                />
              </div>

              <div class="mt-6 flex items-center justify-between gap-4">
                <button
                  class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                  @click="goToStep(1)"
                >
                  ← {{ t("admin.productions.steps.back", "Back") }}
                </button>
                <button
                  class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                  @click="goToStep(3)"
                >
                  {{ t("admin.productions.steps.next", "Next →") }}
                </button>
              </div>
            </div>

            <div
              class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
              >
                {{ t("admin.productions.preview.label", "Live preview") }}
              </p>
              <AdminProductionsPreview
                :data="previewData"
                :tags="selectedTags"
                :series="selectedSeries"
              />
            </div>
          </div>
        </template>

        <!-- ══════════════ STEP 3 — Media ══════════════ -->
        <template v-else-if="currentStep === 3">
          <div class="flex gap-8 items-start">
            <div class="flex-1 min-w-0">
              <div class="mb-6">
                <h2
                  class="font-brand font-black uppercase italic tracking-tight text-xl mb-1"
                >
                  {{ t("admin.productions.steps.media", "Media") }}
                </h2>
                <p class="text-sm text-muted-foreground">
                  {{
                    t(
                      "admin.productions.media.hint",
                      "Upload images for this production.",
                    )
                  }}
                </p>
              </div>

              <!-- Media placeholder — logic added in a future iteration -->
              <div
                class="border-2 border-dashed border-border rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl"
                >
                  🖼
                </div>
                <div>
                  <p
                    class="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1"
                  >
                    {{
                      t("admin.productions.media.comingSoon", "Media upload")
                    }}
                  </p>
                  <p class="text-xs text-muted-foreground/50">
                    {{
                      t(
                        "admin.productions.media.comingSoonHint",
                        "This step will be available soon.",
                      )
                    }}
                  </p>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between gap-4">
                <button
                  class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                  @click="goToStep(2)"
                >
                  ← {{ t("admin.productions.steps.back", "Back") }}
                </button>
                <button
                  class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                  @click="goToStep(4)"
                >
                  {{ t("admin.productions.steps.next", "Next →") }}
                </button>
              </div>
            </div>

            <div
              class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
              >
                {{ t("admin.productions.preview.label", "Live preview") }}
              </p>
              <AdminProductionsPreview
                :data="previewData"
                :tags="selectedTags"
                :series="selectedSeries"
              />
            </div>
          </div>
        </template>

        <!-- ══════════════ STEP 4 — Series ══════════════ -->
        <template v-else-if="currentStep === 4">
          <div class="flex gap-8 items-start">
            <div class="flex-1 min-w-0">
              <div class="mb-6">
                <h2
                  class="font-brand font-black uppercase italic tracking-tight text-xl mb-1"
                >
                  {{ t("admin.productions.steps.series", "Series") }}
                </h2>
                <p class="text-sm text-muted-foreground">
                  {{
                    t(
                      "admin.productions.series.hint",
                      "Link this production to one or more series. New series will be created when you finish.",
                    )
                  }}
                </p>
              </div>

              <div class="border border-border rounded-xl p-6 bg-background">
                <AdminProductionsSeriesSelector
                  :selected="selectedSeries"
                  :mode="props.mode"
                  @change="selectedSeries = $event"
                  @reset="resetStep(4)"
                />
              </div>

              <!-- Submit errors summary -->
              <Transition
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="submitErrors.length > 0"
                  class="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 space-y-1"
                >
                  <p
                    class="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2"
                  >
                    {{
                      t("admin.productions.finish.errors", "Some steps failed:")
                    }}
                  </p>
                  <p
                    v-for="(err, i) in submitErrors"
                    :key="i"
                    class="text-xs text-red-600 dark:text-red-400"
                  >
                    • {{ err }}
                  </p>
                </div>
              </Transition>

              <div class="mt-6 flex items-center justify-between gap-4">
                <button
                  class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                  @click="goToStep(3)"
                >
                  ← {{ t("admin.productions.steps.back", "Back") }}
                </button>
                <button
                  class="h-11 px-8 bg-accent text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  :disabled="isSubmitting"
                  @click="handleFinish"
                >
                  <span
                    v-if="isSubmitting"
                    class="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  />
                  {{
                    isSubmitting
                      ? t("general.saving", "Saving…")
                      : t("admin.productions.steps.finish", "Finish ✓")
                  }}
                </button>
              </div>
            </div>

            <div
              class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start"
            >
              <p
                class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
              >
                {{ t("admin.productions.preview.label", "Live preview") }}
              </p>
              <AdminProductionsPreview
                :data="previewData"
                :tags="selectedTags"
                :series="selectedSeries"
              />
            </div>
          </div>
        </template>
      </div>
    </Transition>
  </div>
</template>

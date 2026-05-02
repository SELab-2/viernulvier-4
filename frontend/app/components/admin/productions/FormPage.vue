<!--
  components/admin/productions/FormPage.vue

  Unified create / edit page for productions.
  Use as:
    pages/admin/productions/create.vue      → <AdminProductionsFormPage mode="create" />
    pages/admin/productions/[id]/edit.vue   → <AdminProductionsFormPage mode="edit" />

  Step routing via query params:
    ?step=1   Core info form  (default)
    ?step=2   Tag linking
    ?step=3   Media (placeholder — built in a future iteration)

  The production ID is kept in ?id=X after step 1 so it persists across steps
  without requiring a route change.
-->
<script setup lang="ts">
import { ChevronLeft, Check, Lock } from "lucide-vue-next";
import { useProductionForm } from "~/composables/productions/useProductionForm";

interface Props {
  mode: "create" | "edit";
}

const props = defineProps<Props>();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// ─── Current step (from query, defaults to 1) ────────────────────────────────
const currentStep = computed(() => Number(route.query.step ?? "1"));

// ─── Production ID ───────────────────────────────────────────────────────────
// In edit mode: comes from the route param.
// In create mode: starts null, gets set after step 1 saves.
const routeParamId = computed(() => {
  if (props.mode !== "edit") return null;
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id;
  const n = parseInt(raw ?? "", 10);
  return isFinite(n) ? n : null;
});

// After step 1 save we also store the ID in ?id= so step 2/3 can read it
// on create mode without a route param.
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
  isLoading,
  isSubmitting,
  error,
  handleNlUpdate,
  handleEnUpdate,
  handleFinalSubmit,
  existingId,
} = useProductionForm({
  mode: props.mode,
  productionId: resolvedId.value,
});

// ─── Steps config ─────────────────────────────────────────────────────────────
const productionExists = computed(
  () => !!(existingId.value ?? resolvedId.value),
);

const STEPS = computed(() => [
  {
    number: 1,
    label: t("admin.productions.steps.coreInfo", "Core info"),
    locked: false,
  },
  {
    number: 2,
    label: t("admin.productions.steps.tags", "Tags"),
    locked: !productionExists.value,
  },
  {
    number: 3,
    label: t("admin.productions.steps.media", "Media"),
    locked: !productionExists.value,
  },
]);

function goToStep(n: number) {
  if (STEPS.value[n - 1]?.locked) return;
  const id = existingId.value ?? resolvedId.value;
  router.push({
    query: {
      step: String(n),
      ...(id ? { id: String(id) } : {}),
    },
  });
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function goBack() {
  if (currentStep.value > 1) {
    goToStep(currentStep.value - 1);
  } else if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/admin/productions");
  }
}

// ─── Step 1: save & proceed ───────────────────────────────────────────────────
async function saveAndContinue() {
  try {
    const result = await handleFinalSubmit();
    const id =
      (result as any)?.data?.id ?? existingId.value ?? resolvedId.value;
    goToStep(2);
    // Make sure the id is in the query after navigation
    if (id && !routeParamId.value) {
      router.replace({ query: { step: "2", id: String(id) } });
    }
  } catch {
    // error ref is set by the composable
  }
}

// ─── Step 2: just proceed (tags are saved immediately on toggle) ───────────────
function continueFromTags() {
  goToStep(3);
}

// ─── Step 3: finish ───────────────────────────────────────────────────────────
function finish() {
  router.push("/admin/productions");
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- ── Sticky top bar ──────────────────────────────────────────────────── -->
    <div
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div
        class="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4"
      >
        <!-- Back -->
        <button
          class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0"
          @click="goBack"
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

        <!-- Step indicator -->
        <div class="flex items-center gap-1 shrink-0">
          <template v-for="(step, i) in STEPS" :key="step.number">
            <div
              v-if="i > 0"
              class="w-6 h-px transition-colors duration-300"
              :class="step.locked ? 'bg-border' : 'bg-accent/40'"
            />
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300"
              :class="[
                currentStep === step.number
                  ? 'bg-foreground text-background'
                  : step.locked
                    ? 'bg-muted/40 text-muted-foreground/30 cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
              ]"
              :disabled="step.locked"
              @click="goToStep(step.number)"
            >
              <Check
                v-if="!step.locked && currentStep > step.number"
                :size="10"
                stroke-width="3"
              />
              <Lock v-else-if="step.locked" :size="10" stroke-width="3" />
              <span v-else class="w-3 text-center">{{ step.number }}</span>
              <span class="hidden sm:inline">{{ step.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ── Loading overlay (edit-mode fetch) ───────────────────────────────── -->
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

    <!-- ── Step content ────────────────────────────────────────────────────── -->
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
        <!-- ════════════════════════════════════════════════════════════════
             STEP 1 — Core info
        ════════════════════════════════════════════════════════════════ -->
        <div v-if="currentStep === 1" class="flex gap-8 items-start">
          <!-- Left: dual-language form -->
          <div class="flex-1 min-w-0">
            <AdminProductionsDualForm
              :liveUpdate="true"
              :initialNl="initialNl"
              :initialEn="initialEn"
              @nl-update="handleNlUpdate"
              @en-update="handleEnUpdate"
            />

            <!-- Error message -->
            <Transition
              enter-active-class="transition-all duration-200"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <p
                v-if="error"
                class="mt-4 text-xs font-medium text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
              >
                {{ error }}
              </p>
            </Transition>

            <!-- Navigation -->
            <div class="mt-6 flex items-center justify-between gap-4">
              <button
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="goBack"
              >
                {{ t("general.cancel", "Cancel") }}
              </button>

              <button
                class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                :disabled="isSubmitting"
                @click="saveAndContinue"
              >
                <span
                  v-if="isSubmitting"
                  class="w-3.5 h-3.5 rounded-full border-2 border-background/40 border-t-background animate-spin"
                />
                {{
                  isSubmitting
                    ? t("general.saving", "Saving…")
                    : t(
                        "admin.productions.steps.saveAndContinue",
                        "Save & continue →",
                      )
                }}
              </button>
            </div>
          </div>

          <!-- Right: sticky live preview -->
          <div class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start">
            <p
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
            >
              {{ t("admin.productions.preview.label", "Live preview") }}
            </p>
            <AdminProductionsPreview :data="previewData" />
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             STEP 2 — Tags
        ════════════════════════════════════════════════════════════════ -->
        <div v-else-if="currentStep === 2" class="flex gap-8 items-start">
          <!-- Left: tag selector -->
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
                    "Select the tags that apply to this production. Changes are saved immediately.",
                  )
                }}
              </p>
            </div>

            <div class="border border-border rounded-xl p-6 bg-background">
              <AdminProductionsTagSelector
                v-if="productionExists"
                :productionId="(existingId ?? resolvedId)!"
              />
            </div>

            <!-- Navigation -->
            <div class="mt-6 flex items-center justify-between gap-4">
              <button
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="goToStep(1)"
              >
                ← {{ t("admin.productions.steps.back", "Back") }}
              </button>

              <button
                class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                @click="continueFromTags"
              >
                {{ t("admin.productions.steps.continue", "Continue →") }}
              </button>
            </div>
          </div>

          <!-- Right: sticky preview (same as step 1) -->
          <div class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start">
            <p
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
            >
              {{ t("admin.productions.preview.label", "Live preview") }}
            </p>
            <AdminProductionsPreview :data="previewData" />
          </div>
        </div>

        <!-- ════════════════════════════════════════════════════════════════
             STEP 3 — Media (placeholder)
        ════════════════════════════════════════════════════════════════ -->
        <div v-else-if="currentStep === 3" class="flex gap-8 items-start">
          <!-- Left: placeholder -->
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
                    "Upload and manage images for this production.",
                  )
                }}
              </p>
            </div>

            <div
              class="border-2 border-dashed border-border rounded-2xl p-16 flex flex-col items-center justify-center gap-4 text-center"
            >
              <div
                class="w-12 h-12 rounded-full bg-muted flex items-center justify-center"
              >
                <span class="text-xl">🖼</span>
              </div>
              <p
                class="text-[11px] font-black uppercase tracking-widest text-muted-foreground"
              >
                {{
                  t(
                    "admin.productions.media.comingSoon",
                    "Media upload coming soon",
                  )
                }}
              </p>
            </div>

            <!-- Navigation -->
            <div class="mt-6 flex items-center justify-between gap-4">
              <button
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="goToStep(2)"
              >
                ← {{ t("admin.productions.steps.back", "Back") }}
              </button>

              <button
                class="h-11 px-8 bg-accent text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                @click="finish"
              >
                {{ t("admin.productions.steps.finish", "Finish ✓") }}
              </button>
            </div>
          </div>

          <!-- Right: sticky preview -->
          <div class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start">
            <p
              class="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-3 text-center"
            >
              {{ t("admin.productions.preview.label", "Live preview") }}
            </p>
            <AdminProductionsPreview :data="previewData" />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Smooth step transition handled by Transition mode="out-in" above */
</style>

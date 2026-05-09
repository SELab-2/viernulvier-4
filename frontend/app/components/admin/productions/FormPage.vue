<script setup lang="ts">
/**
 * components/admin/productions/FormPage.vue
 *
 * Multi-step production form powered by composable-based architecture.
 *
 * Each step is fully isolated and responsible for:
 * - its own draft state
 * - initialization logic
 * - reset behavior
 * - payload extraction
 *
 * Architecture:
 * - Step 1 (core): localized production content form (fully integrated)
 * - Step 2 (tags): production tag selector (fully integrated, composable-driven)
 * - Preview panel: UI-only placeholder for future preview system
 *
 * State management:
 * - Central orchestration is handled by useProductionFormPage
 * - Each step exposes a unified ProductionFormStep interface
 * - Current step is resolved dynamically via currentStepIndex
 *
 * Data flow:
 * - Step components mutate draft state via composable references
 * - FormPage only orchestrates step navigation and lifecycle
 * - No business logic is stored in the page layer
 */

import { ChevronLeft, Check } from "lucide-vue-next";

import { ROUTES } from "~/utils/routes";
import { useProductionFormPage } from "~/composables/productions/useProductionFormPage";
import type { ProductionCoreForm } from "~/composables/productions/steps/productionCore";
import type { ProductionTagsForm } from "~/composables/productions/steps/productionTags";

interface Props {
  mode: "create" | "edit";
}

const props = defineProps<Props>();

const { t } = useI18n();
const router = useRouter();

const form = useProductionFormPage(props.mode);

const stepLabels = computed(() => [
  t("admin.productions.steps.core", "Core info"),
  t("admin.productions.steps.tags", "Tags"),
]);

const isFirstStep = computed(() => {
  return form.currentStepIndex.value === 0;
});

const isLastStep = computed(() => {
  return form.currentStepIndex.value === form.steps.length - 1;
});

const changedFields = computed(() => {
  return form.getCurrentStepChangedFields();
});

async function initialize(): Promise<void> {
  await form.initializeSteps();
}

function goBack(): void {
  router.push(ROUTES.admin.productions.base);
}

function goToStep(index: number): void {
  form.currentStepIndex.value = index;
}

function nextStep(): void {
  form.nextStep();
}

function prevStep(): void {
  form.prevStep();
}

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- TOP BAR -->
    <div
      class="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div
        class="max-w-screen-2xl mx-auto px-6 h-14 flex items-center justify-between gap-4"
      >
        <!-- BACK -->
        <button
          class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors shrink-0"
          @click="goBack"
        >
          <ChevronLeft :size="14" stroke-width="3" />

          {{ t("general.back", "Back") }}
        </button>

        <!-- TITLE -->
        <h1
          class="font-brand font-black uppercase tracking-tight text-sm italic shrink-0"
        >
          {{
            props.mode === "create"
              ? t("admin.productions.create.title", "New production")
              : t("admin.productions.edit.title", "Edit production")
          }}
        </h1>

        <!-- STEPS -->
        <div class="flex items-center gap-1 shrink-0">
          <template v-for="(label, index) in stepLabels" :key="index">
            <div v-if="index > 0" class="w-5 h-px bg-border" />

            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200"
              :class="
                form.currentStepIndex.value === index
                  ? 'bg-foreground text-background'
                  : form.currentStepIndex.value > index
                    ? 'bg-muted text-muted-foreground hover:text-foreground'
                    : 'bg-muted/50 text-muted-foreground/50 hover:text-muted-foreground'
              "
              @click="goToStep(index)"
            >
              <Check
                v-if="form.currentStepIndex.value > index"
                :size="10"
                stroke-width="3"
              />

              <span v-else class="w-3 text-center">
                {{ index + 1 }}
              </span>

              <span class="hidden sm:inline">
                {{ label }}
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- PAGE -->
    <div class="max-w-screen-2xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">
        <!-- LEFT -->
        <div class="flex-1 min-w-0">
          <!-- CHANGED FIELDS -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div
              v-if="props.mode === 'edit' && changedFields.length > 0"
              class="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
              <p class="text-xs font-medium text-amber-700 dark:text-amber-400">
                {{ t("admin.productions.unsavedChanges", "Unsaved changes") }}

                —

                <span class="opacity-70">
                  {{ changedFields.join(", ") }}
                </span>
              </p>
            </div>
          </Transition>

          <!-- STEP 1 -->
          <template v-if="form.currentStep.value.id === 'core'">
            <AdminProductionsDualForm
              v-model="form.currentStep.value.draft.value as ProductionCoreForm"
            />
          </template>

          <!-- STEP 2 -->
          <template v-else-if="form.currentStep.value.id === 'tags'">
            <div class="border border-border rounded-2xl p-10">
              <AdminProductionsTagSelector
                :selected="
                  form.currentStep.value.draft.value as ProductionTagsForm
                "
                @change="
                  (tags) =>
                    ((form.currentStep.value.draft
                      .value as ProductionTagsForm) = tags)
                "
              />
            </div>
          </template>

          <!-- ACTIONS -->
          <div class="mt-6 flex items-center justify-between gap-4">
            <!-- LEFT -->
            <div class="flex items-center gap-3">
              <!-- BACK -->
              <button
                v-if="!isFirstStep"
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="prevStep"
              >
                {{ t("general.previous", "Previous") }}
              </button>

              <!-- CANCEL -->
              <button
                v-else
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="goBack"
              >
                {{ t("general.cancel", "Cancel") }}
              </button>
            </div>

            <!-- RIGHT -->
            <div class="flex items-center gap-3">
              <!-- RESET -->
              <button
                class="h-11 px-6 border border-border rounded-lg text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                @click="form.resetCurrentStep"
              >
                {{ t("general.reset", "Reset") }}
              </button>

              <!-- NEXT -->
              <button
                v-if="!isLastStep"
                class="h-11 px-8 bg-foreground text-background rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all"
                @click="nextStep"
              >
                {{ t("general.next", "Next") }}
              </button>

              <!-- FINISH -->
              <button
                v-else
                class="h-11 px-8 bg-accent text-white rounded-lg text-[11px] font-black uppercase tracking-widest hover:opacity-80 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="form.isSubmitting.value"
                @click="form.finish"
              >
                {{
                  form.isSubmitting.value
                    ? t("general.saving", "Saving…")
                    : t("general.finish", "Finish")
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT / PREVIEW -->
        <div class="w-[400px] xl:w-[440px] shrink-0 sticky top-20 self-start">
          <div
            class="border border-border rounded-2xl p-10 min-h-[400px] flex items-center justify-center"
          >
            <p class="text-sm text-muted-foreground text-center">
              {{
                t(
                  "admin.productions.preview.placeholder",
                  "Preview will appear here",
                )
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

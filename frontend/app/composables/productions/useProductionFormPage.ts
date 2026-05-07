import { useProductionCore } from "~/composables/productions/steps/productionCore";

import { useProductionTags } from "~/composables/productions/steps/productionTags";

export type ProductionFormMode = "create" | "edit";

export function useProductionFormPage(mode: ProductionFormMode) {
  const core = useProductionCore();

  const tags = useProductionTags();

  const steps = [core, tags];

  const currentStepIndex = ref(0);

  const currentStep = computed(() => {
    return steps[currentStepIndex.value]!;
  });

  function nextStep(): void {
    currentStepIndex.value = Math.min(
      currentStepIndex.value + 1,
      steps.length - 1,
    );
  }

  function prevStep(): void {
    currentStepIndex.value = Math.max(currentStepIndex.value - 1, 0);
  }

  function resetCurrentStep(): void {
    currentStep.value.reset();
  }

  function getCurrentStepChangedFields(): string[] {
    return currentStep.value.getChangedFields();
  }

  function extractCurrentStepPayload() {
    return currentStep.value.extractPayload();
  }

  return {
    mode,

    steps,

    currentStep,
    currentStepIndex,

    nextStep,
    prevStep,

    resetCurrentStep,
    getCurrentStepChangedFields,
    extractCurrentStepPayload,
  };
}

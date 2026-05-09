import { useProductionCore } from "~/composables/productions/steps/productionCore";
import { useProductionTags } from "~/composables/productions/steps/productionTags";
import { useRoute } from "vue-router";

export type ProductionFormMode = "create" | "edit";

export function useProductionFormPage(mode: ProductionFormMode) {
  const route = useRoute();
  const router = useRouter();
  const productionApi = useProductionApi();
  const tagApi = useTagApi();

  const core = useProductionCore();
  const tags = useProductionTags();

  const steps = [core, tags];

  const currentStepIndex = ref(0);
  const isSubmitting = ref(false);

  const currentStep = computed(() => steps[currentStepIndex.value]!);

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

  async function finish(): Promise<void> {
    if (isSubmitting.value) return;
    isSubmitting.value = true;

    try {
      const corePayload = core.extractPayload();
      const tagsPayload = tags.extractPayload();

      // Remap from per-locale translation objects to LocalizedString fields
      const productionBody = {
        titel: { nl: corePayload.nl.titel, en: corePayload.en.titel },
        description1: {
          nl: corePayload.nl.description1,
          en: corePayload.en.description1,
        },
        description2:
          corePayload.nl.description2 !== null ||
          corePayload.en.description2 !== null
            ? {
                nl: corePayload.nl.description2 ?? "",
                en: corePayload.en.description2 ?? "",
              }
            : null,
        artist:
          corePayload.nl.artist !== null || corePayload.en.artist !== null
            ? {
                nl: corePayload.nl.artist ?? "",
                en: corePayload.en.artist ?? "",
              }
            : null,
        tagline:
          corePayload.nl.tagline !== null || corePayload.en.tagline !== null
            ? {
                nl: corePayload.nl.tagline ?? "",
                en: corePayload.en.tagline ?? "",
              }
            : null,
        credits:
          corePayload.nl.credits !== null || corePayload.en.credits !== null
            ? {
                nl: corePayload.nl.credits ?? "",
                en: corePayload.en.credits ?? "",
              }
            : null,
        performer_type: null,
        attendance_mode: null,
      };

      if (mode === "create") {
        // 1. Create the production
        const res = await productionApi.create(productionBody);

        if (!res.data) throw new Error("Failed to create production");

        const productionId = res.data.id;

        // 2. Create new tags and collect all IDs to connect
        const newTagIds = await Promise.all(
          tagsPayload.create.map(async (label) => {
            const created = await tagApi.create({
              tag: { nl: label, en: label },
            });
            if (!created.data)
              throw new Error(`Failed to create tag: ${label}`);
            return created.data.id;
          }),
        );

        // 3. Connect all tags (existing selections + freshly created)
        await Promise.all(
          [...tagsPayload.connect, ...newTagIds].map((tagId) =>
            productionApi.addTag(productionId, tagId),
          ),
        );
      } else {
        // Edit mode — id is guaranteed to be set
        const idParam = route.params.id;
        if (typeof idParam !== "string")
          throw new Error("Missing production ID");
        const productionId = Number(idParam);

        // 1. Replace core content
        await productionApi.replace(productionId, productionBody);

        // 2. Create new tags and collect their IDs
        const newTagIds = await Promise.all(
          tagsPayload.create.map(async (label) => {
            const created = await tagApi.create({
              tag: { nl: label, en: label },
            });
            if (!created.data)
              throw new Error(`Failed to create tag: ${label}`);
            return created.data.id;
          }),
        );

        // 3. Connect new tags (existing + freshly created) and disconnect removed ones
        await Promise.all([
          ...[...tagsPayload.connect, ...newTagIds].map((tagId) =>
            productionApi.addTag(productionId, tagId),
          ),
          ...tagsPayload.disconnect.map((tagId) =>
            productionApi.removeTag(productionId, tagId),
          ),
        ]);
      }
      await router.push(ROUTES.admin.productions.base);
    } finally {
      isSubmitting.value = false;
    }
  }

  async function initializeSteps(): Promise<void> {
    const idParam = route.params.id;

    const context = {
      mode,
      id: mode === "edit" && typeof idParam === "string" ? idParam : undefined,
    };

    await Promise.all(steps.map((step) => step.initialize(context)));
  }

  return {
    mode,
    steps,
    currentStep,
    currentStepIndex,
    isSubmitting,
    nextStep,
    prevStep,
    resetCurrentStep,
    getCurrentStepChangedFields,
    finish,
    initializeSteps,
  };
}

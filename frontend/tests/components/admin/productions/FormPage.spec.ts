import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { ref, computed, type Ref } from "vue";
import FormPage from "../../../../app/components/admin/productions/FormPage.vue";
import * as useProductionFormPageModule from "../../../../app/composables/productions/useProductionFormPage";

const mockPush = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await (
    importOriginal as () => Promise<Record<string, unknown>>
  )();
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      afterEach: vi.fn(),
    }),
  };
});

vi.mock(
  "../../../../app/composables/productions/useProductionFormPage",
  () => ({
    useProductionFormPage: vi.fn(),
  }),
);

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      "admin-productions": {
        steps: {
          core: "General",
          tags: "Tags",
          media: "Media",
          events: "Events",
          series: "Series",
        },
        "create-title": "New Production",
        "edit-title": "Edit Production",
      },
      admin: {
        back: "Back",
        previous: "Previous",
        cancel: "Cancel",
        reset: "Reset",
        next: "Next",
        finish: "Finish",
        saving: "Saving...",
        productions: {
          unsavedChanges: "Unsaved changes",
        },
      },
    },
  },
});

interface MockStep {
  id: string;
  draft: Ref<unknown>;
}

interface MockForm {
  currentStepIndex: Ref<number>;
  steps: MockStep[];
  currentStep: Ref<MockStep>;
  isSubmitting: Ref<boolean>;
  initializeSteps: Mock;
  nextStep: Mock;
  prevStep: Mock;
  resetCurrentStep: Mock;
  finish: Mock;
  getCurrentStepChangedFields: Mock;
}

describe("AdminProductionsFormPage", () => {
  let mockForm: MockForm;

  beforeEach(() => {
    vi.clearAllMocks();
    const currentStepIndex = ref(0);
    const steps: MockStep[] = [
      { id: "core", draft: ref({}) },
      { id: "tags", draft: ref([]) },
      { id: "media", draft: ref({}) },
      { id: "events", draft: ref([]) },
      { id: "series", draft: ref({}) },
    ];
    mockForm = {
      currentStepIndex,
      steps,
      currentStep: computed(
        () => steps[currentStepIndex.value],
      ) as unknown as Ref<MockStep>,
      isSubmitting: ref(false),
      initializeSteps: vi.fn().mockResolvedValue(undefined),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      resetCurrentStep: vi.fn(),
      finish: vi.fn(),
      getCurrentStepChangedFields: vi.fn().mockReturnValue([]),
    };
    (useProductionFormPageModule.useProductionFormPage as Mock).mockReturnValue(
      mockForm,
    );
  });

  it("renders correctly and initializes on mount", async () => {
    const wrapper = mount(FormPage, {
      global: {
        plugins: [i18n],
        stubs: {
          ChevronLeft: true,
          Check: true,
          AdminProductionsDualForm: true,
          AdminProductionsTagSelector: true,
          AdminProductionsMediaForm: true,
          AdminProductionsEventsForm: true,
          AdminProductionsSeriesForm: true,
          AdminProductionsPreview: true,
        },
      },
      props: { mode: "create" },
    });

    await flushPromises();
    expect(mockForm.initializeSteps).toHaveBeenCalled();
    expect(wrapper.text()).toContain("New Production");
    expect(wrapper.text()).toContain("General");
  });

  it("navigates to next step when Next button is clicked", async () => {
    const wrapper = mount(FormPage, {
      global: {
        plugins: [i18n],
        stubs: {
          ChevronLeft: true,
          Check: true,
          AdminProductionsDualForm: true,
          AdminProductionsPreview: true,
        },
      },
      props: { mode: "create" },
    });

    const buttons = wrapper.findAll("button");
    const nextBtn = buttons.find((b) => b.text().includes("Next"));
    await nextBtn?.trigger("click");

    expect(mockForm.nextStep).toHaveBeenCalled();
  });

  it("navigates to previous step when Previous button is clicked", async () => {
    mockForm.currentStepIndex.value = 1;

    const wrapper = mount(FormPage, {
      global: {
        plugins: [i18n],
        stubs: {
          ChevronLeft: true,
          Check: true,
          AdminProductionsTagSelector: true,
          AdminProductionsPreview: true,
        },
      },
      props: { mode: "create" },
    });

    const buttons = wrapper.findAll("button");
    const prevBtn = buttons.find((b) => b.text().includes("Previous"));
    await prevBtn?.trigger("click");

    expect(mockForm.prevStep).toHaveBeenCalled();
  });

  it("calls finish when on last step and Finish is clicked", async () => {
    mockForm.currentStepIndex.value = 4;

    const wrapper = mount(FormPage, {
      global: {
        plugins: [i18n],
        stubs: {
          ChevronLeft: true,
          Check: true,
          AdminProductionsSeriesForm: true,
          AdminProductionsPreview: true,
        },
      },
      props: { mode: "create" },
    });

    const buttons = wrapper.findAll("button");
    const finishBtn = buttons.find((b) => b.text().includes("Finish"));
    await finishBtn?.trigger("click");

    expect(mockForm.finish).toHaveBeenCalled();
  });
});

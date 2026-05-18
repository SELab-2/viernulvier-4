<script setup lang="ts">
/**
 * A dynamic form component that renders fields based on a given array, includes:
 *  - Supports all base field components (BaseInput, BaseTextArea, BaseDate,
 *    BaseTagInput, BaseFileUpload, BaseSelect, BaseMultiSelect, AdminEditor)
 *  - Multiple instances of the same component type are supported
 *  - Pre-filled values supported (the key must match the field name)
 *  - Emits all field values on submit via @submit
 *  - When liveUpdate is true, also emits @update on every field change (for live previews)
 *  - Resets all field values to initial values via a reset-button
 *
 * Supports two modes:
 *
 * 1. Uncontrolled mode (legacy)
 *    - FormBaseForm owns its internal state
 *    - Uses initialValues
 *    - Existing pages continue working without changes
 *
 * 2. Controlled mode
 *    - Parent owns the state via v-model
 *    - FormBaseForm becomes a pure renderer
 *    - Used for complex multi-step flows and live preview systems
 *
 * Usage (uncontrolled):
 * <FormBaseForm
 *   :fields="fields"
 *   :initialValues="{ title: 'Default title' }"
 *   @submit="handleSubmit"
 * />
 *
 * Usage (controlled):
 * <FormBaseForm
 *   v-model="draft"
 *   :fields="fields"
 * />
 *
 * Example fields config:
 * const fields: FormField[] = [
 *   { component: 'BaseInput',    name: 'title',   props: { label: 'Title', required: true } },
 *   { component: 'BaseDate',     name: 'dueDate', props: { label: 'Due Date' } },
 *   { component: 'AdminEditor',  name: 'body',    props: { placeholder: 'Write here…' } },
 * ]
 */

import { computed, reactive, watch, toRaw } from "vue";
import type { FieldComponent, FormField } from "../../types/FormField";

// Nuxt auto-import only works for direct template usage, so manual imports are
// needed here (these are referenced dynamically via the components map).
import BaseInput from "./fields/BaseInput.vue";
import BaseTextArea from "./fields/BaseTextArea.vue";
import BaseDate from "./fields/BaseDate.vue";
import BaseFileUpload from "./fields/BaseFileUpload.vue";
import BaseTagInput from "./fields/BaseTagInput.vue";
import BaseSelect from "./fields/BaseSelect.vue";
import BaseMultiSelect from "./fields/BaseMultiSelect.vue";
import AdminEditor from "../admin/Editor.vue";

const { t } = useI18n();

interface Props {
  fields: FormField[]; // Can store multiple fields, allows us to have multiple of the same type
  initialValues?: Record<string, any>; // Optional pre-filled values for uncontrolled mode
  submitLabel?: string; // Text on the submit button
  resetLabel?: string; // Text on the reset button
  showActions?: boolean; // Whether to show submit/reset buttons, default is true

  /**
   * When true, emits @update with the full form state on every field change.
   * Useful for live preview systems. Use only when using the uncontrolled mode, otherwise it does not work.
   */
  liveUpdate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  liveUpdate: false,
});

const model = defineModel<Record<string, any>>();

const { fields, initialValues, submitLabel, resetLabel } = props;

/**
 * Internal state used only in uncontrolled mode.
 * Existing pages still rely on this behavior.
 */
const internalForm = reactive<Record<string, any>>({
  ...(initialValues ?? {}),
});

/**
 * Unified form state.
 *
 * Controlled mode:
 *  - uses v-model from parent
 *
 * Uncontrolled mode:
 *  - falls back to internal reactive state
 */
const formState = computed<Record<string, any>>({
  get() {
    return model.value ?? internalForm;
  },

  set(value) {
    /**
     * Controlled mode:
     * parent owns state
     */
    if (model.value) {
      model.value = value;
      return;
    }

    /**
     * Uncontrolled mode:
     * mutate internal state
     */
    Object.keys(internalForm).forEach((key) => delete internalForm[key]);

    Object.assign(internalForm, value);
  },
});

const components: Record<FieldComponent, any> = {
  // mapping
  BaseInput,
  BaseTextArea,
  BaseDate,
  BaseFileUpload,
  BaseTagInput,
  BaseSelect,
  BaseMultiSelect,
  AdminEditor,
};

const emit = defineEmits<{
  submit: [Record<string, any>];

  /**
   * Fired on every field change when liveUpdate prop is true
   */
  update: [Record<string, any>];
}>();

// ─── Live update watcher ─────────────────────────────────────────────────────
// Only active when liveUpdate is true, so pages without a preview pay no cost.
watch(
  formState,
  (newVal) => {
    if (props.liveUpdate) {
      emit("update", structuredClone(toRaw(newVal)));
    }
  },
  { deep: true },
);

const multiSelectRefs = ref<InstanceType<typeof BaseMultiSelect>[]>([]); // references all instances of BaseMultiSelect

function submit() {
  emit("submit", structuredClone(toRaw(formState.value)));
}

function reset() {
  /**
   * Controlled mode:
   * parent owns reset logic
   *
   * Example:
   * currentStep.reset()
   */
  if (model.value) {
    emit("update", structuredClone(toRaw(model.value)));
    return;
  }

  /**
   * Uncontrolled mode:
   * reset internal state to initial values
   */
  Object.keys(internalForm).forEach((key) => delete internalForm[key]);

  Object.assign(internalForm, initialValues ?? {});

  multiSelectRefs.value.forEach((c) => c?.clear()); // needed so half typed input also gets cleared

  multiSelectRefs.value = [];
}

defineExpose({ reset });

onBeforeUpdate(() => {
  multiSelectRefs.value = [];
});

function collectMultiSelectRef(el: any) {
  // adds to the array if MultiSelect and if mounted
  if (el) multiSelectRefs.value.push(el);
}
</script>

<template>
  <form
    @submit.prevent="submit"
    class="m-0 border border-border rounded-lg bg-background overflow-hidden"
  >
    <!-- All components of the form under each other -->
    <component
      v-for="field in fields"
      :key="field.name"
      :is="components[field.component]"
      v-model="formState[field.name]"
      :id="field.name"
      v-bind="field.props"
      :ref="
        field.component === 'BaseMultiSelect'
          ? collectMultiSelectRef
          : undefined
      "
    />

    <!-- Buttons -->
    <div v-if="props.showActions" class="p-4 flex gap-3 justify-end">
      <!-- Reset button -->
      <button
        type="button"
        @click="reset"
        class="h-10 w-60 px-6 inline-flex items-center justify-center rounded-lg bg-primary border-2 border-primary text-primary-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-primary transition cursor-pointer"
      >
        {{ resetLabel ?? t("baseform.resetbutton") }}
      </button>

      <!-- Submit button -->
      <button
        type="submit"
        class="h-10 w-60 px-6 inline-flex items-center justify-center rounded-lg bg-accent border-2 border-accent text-accent-foreground font-brand font-black text-[11px] uppercase tracking-widest leading-none hover:bg-transparent hover:text-accent transition cursor-pointer"
      >
        {{ submitLabel ?? t("baseform.submitbutton") }}
      </button>
    </div>
  </form>
</template>

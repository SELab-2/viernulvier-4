<script setup lang="ts">
/**
 * A dynamic form component that renders fields based on a given array, includes:
 *  - Supports all base field components (BaseInput, BaseTextArea, BaseDate,
 *    BaseTagInput, BaseFileUpload, BaseSelect, BaseMultiSelect, AdminEditor)
 *  - Multiple instances of the same component type are supported
 *  - Pre-filled values supported (the key must match the field name)
 *  - Emits all field values on submit via @submit
 *  - Resets all field values to initial values via a reset-button
 *
 * Usage:
 * <FormBaseForm
 *   :fields="fields"
 *   :initialValues="{ title: 'Default title' }"
 *   @submit="handleSubmit"
 * />
 *
 * Example fields config:
 * const fields: FormField[] = [
 *   { component: 'BaseInput',    name: 'title',   props: { label: 'Title', required: true } },
 *   { component: 'BaseDate',     name: 'dueDate', props: { label: 'Due Date' } },
 *   { component: 'AdminEditor',  name: 'body',    props: { placeholder: 'Write here…' } },
 * ]
 */

import { reactive } from "vue";
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
  initialValues?: Record<string, any>; // Optional pre-filled values
  submitLabel?: string; // Text on the submit button
  resetLabel?: string; // Text on the empty button
}

const { fields, initialValues, submitLabel, resetLabel } = defineProps<Props>();
const form = reactive<Record<string, any>>({ ...initialValues });

const components: Record<FieldComponent, any> = {
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
}>();

const multiSelectRefs = ref<InstanceType<typeof BaseMultiSelect>[]>([]);

function submit() {
  emit("submit", form);
}

function reset() {
  Object.keys(form).forEach((key) => delete form[key]);
  Object.assign(form, initialValues ?? {});
  multiSelectRefs.value.forEach((c) => c?.clear());
  multiSelectRefs.value = [];
}

defineExpose({ reset });

onBeforeUpdate(() => {
  multiSelectRefs.value = [];
});

function collectMultiSelectRef(el: any) {
  if (el) multiSelectRefs.value.push(el);
}
</script>

<template>
  <form
    @submit.prevent="submit"
    class="m-0 border border-border rounded-lg bg-background overflow-hidden"
  >
    <component
      v-for="field in fields"
      :key="field.name"
      :is="components[field.component]"
      v-model="form[field.name]"
      :id="field.name"
      v-bind="field.props"
      :ref="
        field.component === 'BaseMultiSelect'
          ? collectMultiSelectRef
          : undefined
      "
    />

    <div class="p-4 flex gap-3">
      <button
        type="submit"
        class="flex-1 h-12 bg-primary/80 dark:bg-primary/60 text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg hover:opacity-70 dark:hover:bg-primary/50 dark:text-bg-primary/80 dark:border dark:border-border cursor-pointer"
      >
        {{ submitLabel ?? t("baseform.submitbutton") }}
      </button>
      <button
        type="button"
        @click="reset"
        class="flex-1 h-12 bg-primary/80 dark:bg-primary/60 text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg hover:opacity-70 dark:hover:bg-primary/50 dark:text-bg-primary/80 dark:border dark:border-border cursor-pointer"
      >
        {{ resetLabel ?? t("baseform.resetbutton") }}
      </button>
    </div>
  </form>
</template>

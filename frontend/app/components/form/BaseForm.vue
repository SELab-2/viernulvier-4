<script setup lang="ts">
/**
 * A dynamic form component that renders fields based on a given array, includes:
 *  - Supports all base field components (BaseInput, BaseTextArea, BaseDate, BaseTagInput, BaseFileUpload, BaseSelect, BaseMultiSelect)
 *  - Multiple instances of the same component type are supported
 *  - Pre-filled values supported (the key needs to match the name of the field you want to fill in)
 *  - Emits all field values on submit via @submit
 *  - Resets all field values to inital values via a reset-button
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
 *   { component: 'BaseInput', name: 'title', props: { label: 'Title', required: true } },
 *   { component: 'BaseDate',  name: 'dueDate', props: { label: 'Due Date' } }
 * ]
 */

import { reactive } from "vue"; // reactive instead of ref so we don't have to add ".value" every time
import type { FieldComponent, FormField } from "../../types/FormField";

// Nuxt auto-import only works for direct template usage, therefore manual imports are needed here (since we use the components in script section)
import BaseInput from "./fields/BaseInput.vue";
import BaseTextArea from "./fields/BaseTextArea.vue";
import BaseDate from "./fields/BaseDate.vue";
import BaseFileUpload from "./fields/BaseFileUpload.vue";
import BaseTagInput from "./fields/BaseTagInput.vue";
import BaseSelect from "./fields/BaseSelect.vue";
import BaseMultiSelect from "./fields/BaseMultiSelect.vue";
const { t } = useI18n();

interface Props {
  fields: FormField[]; // Can store multiple fields, allows us to have multiple of the same type
  initialValues?: Record<string, any>; // Optional pre-filled values
}

const { fields, initialValues } = defineProps<Props>();
const form = reactive<Record<string, any>>({ ...initialValues }); // form will hold all dynamic values, will be prefilled with initialValues
const components: Record<FieldComponent, any> = {
  // mapping
  BaseInput,
  BaseTextArea,
  BaseDate,
  BaseFileUpload,
  BaseTagInput,
  BaseSelect,
  BaseMultiSelect,
};

const emit = defineEmits<{
  submit: [Record<string, any>];
}>();

const multiSelectRefs = ref<InstanceType<typeof BaseMultiSelect>[]>([]); // references all instances of BaseMultiSelect

function submit() {
  emit("submit", form); // current state of the form will be send to parent component
}

function reset() {
  // clears everything, restores initial values
  Object.keys(form).forEach((key) => delete form[key]);
  Object.assign(form, initialValues ?? {});
  multiSelectRefs.value.forEach((c) => c?.clear()); // needed zo half typed in input also gets cleared
  multiSelectRefs.value = [];
}

defineExpose({
  reset,
});

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
      v-model="form[field.name]"
      :id="field.name"
      v-bind="field.props"
      :ref="
        field.component === 'BaseMultiSelect'
          ? collectMultiSelectRef
          : undefined
      "
    />

    <!-- Buttons -->
    <div class="p-4 flex gap-3">
      <!-- Submit button -->
      <button
        type="submit"
        class="flex-1 h-12 bg-primary/80 dark:bg-primary/60 text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg hover:opacity-70 dark:hover:bg-primary/50 dark:text-bg-primary/80 dark:border dark:border-border cursor-pointer"
      >
        {{ t("baseform.submitbutton") }}
      </button>
      <!-- Reset button -->
      <button
        type="button"
        @click="reset"
        class="flex-1 h-12 bg-primary/80 dark:bg-primary/60 text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg hover:opacity-70 dark:hover:bg-primary/50 dark:text-bg-primary/80 dark:border dark:border-border cursor-pointer"
      >
        {{ t("baseform.resetbutton") }}
      </button>
    </div>
  </form>
</template>

<style scoped></style>

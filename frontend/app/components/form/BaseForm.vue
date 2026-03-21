<script setup lang="ts">
/**
 * A dynamic form component that renders fields based on a given array, includes:
 *  - Supports all base field components (BaseInput, BaseTextArea, BaseDate, BaseTagInput, BaseFileUpload)
 *  - Multiple instances of the same component type are supported
 *  - Emits all field values on submit via @submit
 *
 * Usage:
 * <FormBaseForm
 *   :fields="fields"
 *   @submit="handleSubmit"
 * />
 *
 * Example fields config:
 * const fields: FormField[] = [
 *   { component: 'BaseInput', name: 'title', props: { label: 'Title', required: true } },
 *   { component: 'BaseDate',  name: 'dueDate', props: { label: 'Due Date' } }
 * ]
 */

import { reactive } from 'vue' // reactive instead of ref so we don't have to add ".value" every time
import type {FieldComponent, FormField} from '../../types/FormField'

// Nuxt auto-import only works for direct template usage, therefore manual imports are needed here (since we use the components in script section)
import BaseInput from "./fields/BaseInput.vue";
import BaseTextArea from "./fields/BaseTextArea.vue";
import BaseDate from "./fields/BaseDate.vue";
import BaseFileUpload from "./fields/BaseFileUpload.vue";
import BaseTagInput from "./fields/BaseTagInput.vue";


interface Props {
  fields: FormField[] // Can store multiple fields, allows us to have multiple of the same type
}

const { fields } = defineProps<Props>() // shortcut for const props = defineProps<Props>(); const fields = props.fields
const form = reactive<Record<string, any>>({}) // form will hold all dynamic values
const components: Record<FieldComponent, any> = { // mapping
  BaseInput,
  BaseTextArea,
  BaseDate,
  BaseFileUpload,
  BaseTagInput
}

const emit = defineEmits<{
  submit: [Record<string, any>]
}>()

function submit() {
  emit('submit', form) // current state of the form will be send to parent component
}
</script>

<template>
  <form @submit.prevent="submit" class="m-4 border border-border rounded-lg bg-background overflow-hidden">
    <!-- All components of the form under each other -->
    <component
        v-for="field in fields"
        :key="field.name"
        :is="components[field.component]"
        v-model="form[field.name]"
        :id="field.name"
        v-bind="field.props"
    />

    <!-- Submit button -->
    <div class="p-4">
      <button
        type="submit"
        class="w-full h-12 bg-primary/80 text-primary-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg transition-colors duration-150 hover:opacity-90 cursor-pointer"
      >
        Submit
      </button>
    </div>
  </form>
</template>

<style scoped>
</style>
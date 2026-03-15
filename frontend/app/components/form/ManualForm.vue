<script setup lang="ts">
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
  <form class="base-form" @submit.prevent="submit">
    <component
        v-for="field in fields"
        :key="field.name"
        :is="components[field.component]"
        v-model="form[field.name]"
        :id="field.name"
        v-bind="field.props"
    />

    <button type="submit" class="submit-btn">
      Submit
    </button>
  </form>
</template>

<style scoped>
.base-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submit-btn {
  margin-top: 1rem;
  height: 3rem;
  border-radius: 0.5rem;
  border: none;
  background: black;
  color: white;
  font-weight: 500;
  cursor: pointer;
}
</style>
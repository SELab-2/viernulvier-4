<script setup lang="ts">
import type { FormField } from "../types/FormField";
import { ref } from "vue";

const fields: FormField[] = [
  {
    component: 'BaseInput',
    name: 'title',
    props: {
      label: 'Title',
      placeholder: 'Enter title',
      required: true
    }
  },
  {
    component: 'BaseInput', // 2 instances of the same component should be possible
    name: 'num',
    props: {
      label: 'Number',
      placeholder: 'Enter a number',
      type: 'number', // this one asks for a number
    } // this one is not required
  },
  {
    component: 'BaseTextArea',
    name: 'description',
    props: {
      label: 'Description',
      placeholder: 'Enter description',
      rows: 6
    }
  },
  {
    component: 'BaseDate',
    name: 'dueDate',
    props: {
      label: 'Due Date',
      required: true
    }
  },
  {
    component: 'BaseTagInput',
    name: 'tags',
    props: {
      label: 'Tags',
      placeholder: 'Add tags'
    }
  },
  {
    component: 'BaseFileUpload',
    name: 'attachment',
    props: {
      label: 'Attachment',
      multiple: true
    }
  }
]

const submittedData = ref<Record<string, any> | null>(null)
function handleSubmit(formData: Record<string, any>) {
  submittedData.value = formData
}
</script>

<template>
  <div @input="submittedData = null">
    <FormBaseForm :fields="fields" @submit="handleSubmit" />
  </div>

  <br>
  <!-- To see the results after clicking submit -->
  <div v-if="submittedData">
    <p>Submitted values:</p>
    <div v-for="(value, key) in submittedData" :key="key">
      <span>{{ key }}: </span>
      <span>{{ value }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
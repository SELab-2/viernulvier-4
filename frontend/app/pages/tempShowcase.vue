<script setup lang="ts">
import type { FormField } from "../types/FormField";

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
    component: 'BaseTextArea',
    name: 'description',
    props: {
      label: 'Description',
      placeholder: 'Enter description',
      rows: 3
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

function handleSubmit(formData: Record<string, any>) {
  // does nothing for the moment
}
</script>

<template>
  <FormManualForm :fields="fields" @submit="handleSubmit" />
</template>

<style scoped>

</style>
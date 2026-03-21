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
    component: 'BaseSelect',
    name: 'category',
    props: {
      label: 'Category',
      options: ['Option A', 'Option B', 'Option C'],
      required: true
    }
  },
  {
    component: 'BaseMultiSelect',
    name: 'multiselect',
    props: {
      label: 'Multi Select',
      options: ['Banana', 'Apple', 'Pineapple', 'Grape', 'Mango', "Blueberry", "Lychee"],
      multiple: true,
      freeInput: true
    }
  },
  {
    component: 'BaseFileUpload',
    name: 'multipleattachments',
    props: {
      label: 'Multiple Attachments',
      multiple: true
    }
  },
  {
    component: 'BaseFileUpload',
    name: 'singularattachment',
    props: {
      label: 'Singular Attachment',
    }
  }]

const submittedData = ref<Record<string, any> | null>(null)
function handleSubmit(formData: Record<string, any>) {
  submittedData.value = formData
}

function isFileArray(value: any): value is File[] {
  return Array.isArray(value) && value.length > 0 && value[0] instanceof File
}
function objectURL(file: File): string {
  return URL.createObjectURL(file)
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

      <!-- Case file array -->
      <span v-if="isFileArray(value)">
        <div v-for="file in value" :key="file.name">
          <img v-if="file.type.startsWith('image/')" :src="objectURL(file)" style="max-width: 200px; display: block;" />
        </div>
      </span>

      <!-- Everything else -->
      <span v-else>{{ value }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>
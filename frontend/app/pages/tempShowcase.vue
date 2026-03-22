<script setup lang="ts">
import type { FormField } from "../types/FormField";

const { locale, setLocale } = useI18n()
const isDark = ref(false)

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
    component: 'BaseMultiSelect',
    name: 'multiselect2',
    props: {
      label: 'Multi Select (only given options allowed)',
      options: ['Banana', 'Apple', 'Pineapple', 'Grape', 'Mango', "Blueberry", "Lychee"],
      multiple: true,
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

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle("dark", isDark.value)
}
</script>

<template>
  <div @input="submittedData = null">
    <FormBaseForm
        :fields="fields"
        :initialValues="{ num: 6 }"
        @submit="handleSubmit" />
  </div>

  <br>
  <!-- To see the results after clicking submit -->
  <div v-if="submittedData">
    <p>Submitted values:</p>
    <div v-for="(value, key) in submittedData" :key="key">
      <span>{{ key }}: </span>

      <!-- Case file array -->
      <span v-if="isFileArray(value)">
        <span v-for="file in value" :key="file.name" style="display: block;">
          <img v-if="file.type.startsWith('image/')" :src="objectURL(file)" :alt="file.name" style="max-width: 200px; display: block;" />
        </span>
      </span>

      <!-- Everything else -->
      <span v-else>{{ value }}</span>
    </div>
  </div>
  <div class="flex gap-2 m-4">
    <!-- knop om i18n the testen -->
    <button @click="toggleLocale" class="btn-outline">
      {{ locale.toUpperCase() }}
    </button>
    <br>
    <!-- knop om light-dark the testen -->
    <button @click="toggleDark" class="btn-outline">
      {{ isDark ? "Light" : "Dark" }}
    </button>
  </div>
</template>

<style scoped>

</style>
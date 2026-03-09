<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    label?: string
    id?: string
    required?: boolean
    accept?: string
    multiple?: boolean
  }
  const props = withDefaults(defineProps<Props>(), {
    accept: '',
    multiple: false
  })

  const model = defineModel<File[]>({
    default: [] as File[]
  })

  const displayName = computed(() => model.value.map(f => f.name).join(', '))

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (!target.files) return

    const filesArray = Array.from(target.files)
    if (props.multiple) {
      model.value = filesArray
    } else {
      model.value = filesArray.length > 0 ? [filesArray[0]!] : []
    }
  }
</script>

<template>
  <div class="base-input">
    <label v-if="props.label" :for="props.id" class="input-label">
      {{ props.label }} <span v-if="props.required" class="required-star">*</span>
    </label>

    <div class="file-input-wrapper">
      <input
          :id="props.id"
          type="file"
          :required="props.required"
          :accept="props.accept"
          :multiple="props.multiple"
          @change="handleFileChange"
          class="input-field"
      />
      <div class="file-name" v-if="displayName">{{ displayName }}</div>
    </div>
  </div>
</template>

<style scoped>
  .base-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .required-star {
    color: inherit;
  }

  .file-input-wrapper {
    display: flex;
    flex-direction: column;
  }

  .input-field {
    width: 100%;
    height: 3rem;
    padding: 0 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background-color: #ffffff;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-field:focus {
    border-color: #d1d5db;
  }

  .file-name {
    position: static;
    margin-top: 0.25rem;
    pointer-events: none;
    color: #374151;
    font-size: 0.95rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
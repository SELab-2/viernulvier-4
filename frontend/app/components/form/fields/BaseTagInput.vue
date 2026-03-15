<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label?: string
  placeholder?: string
  id?: string
  required?: boolean
}
defineProps<Props>()

const model = defineModel<string[]>({ default: [] })
const inputText = ref('')

function addTag() {
  const value = inputText.value.trim()
  if (value && !model.value.includes(value)) {
    model.value.push(value)
  }
  inputText.value = ''
}

function removeTag(tag: string) {
  model.value = model.value.filter(t => t !== tag)
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  }
}
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>

    <div class="tag-input-wrapper">
      <span
          v-for="tag in model"
          :key="tag"
          class="tag"
      >
        {{ tag }}
        <span class="remove-tag" @click.stop="removeTag(tag)">×</span>
      </span>

      <input
          ref="input"
          type="text"
          :placeholder="placeholder"
          v-model="inputText"
          @keydown.enter="handleKey"
          class="input-field tag-input"
      />
    </div>
  </div>
</template>

<style scoped>
.input-label {
display: block;
margin-bottom: 0.25rem;
font-size: 0.875rem;
font-weight: 500;
}

.required-star {
  color: inherit;
}

.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  min-height: 3rem;
  cursor: text;
}

.tag-input-wrapper:focus-within {
  border-color: #d1d5db;
}

.tag {
  background-color: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.remove-tag {
  margin-left: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  min-width: 120px;
  font-size: 1rem;
  padding: 0.25rem;
  background-color: transparent;
}
</style>
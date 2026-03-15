<script setup lang="ts">
interface Props {
  label?: string
  placeholder?: string
  id?: string
  required?: boolean
  rows?: number
}
withDefaults(defineProps<Props>(), {
  rows: 5
})

const model = defineModel<string>()
</script>

<template>
  <div class="base-textarea">
    <label v-if="label" :for="id" class="textarea-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>

    <textarea
        :id="id"
        :placeholder="placeholder"
        v-model="model"
        :required="required"
        :rows="rows"
        class="textarea-field"
    />
  </div>
</template>

<style scoped>
.base-textarea {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.textarea-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.required-star {
  color: inherit;
}

.textarea-field {
  width: 100%;
  min-height: 6rem;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #ffffff;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
}

.textarea-field:focus {
  border-color: #d1d5db;
}
</style>
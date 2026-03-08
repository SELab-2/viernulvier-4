<script setup lang="ts">
defineProps({
  label: String,
  placeholder: String,
  type: {
    type: String,
    default: 'text'
  },
  id: String,
  required: Boolean
})

const model = defineModel<string | number>()
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>
    <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        v-model="model"
        :required="required"
        class="input-field"
    />
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
  color: #374151; /* gray-700 */
}
.required-star {
  color: inherit;
}
.input-field {
  width: 100%;
  height: 3rem;
  padding: 0 0.75rem;
  border: 1px solid #d1d5db; /* gray-300 */
  border-radius: 0.5rem;
  background-color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus {
  border-color: #3b82f6;
}
</style>
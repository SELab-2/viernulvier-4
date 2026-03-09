<script setup lang="ts">
  interface Props {
    label?: string
    id?: string
    required?: boolean
    options: string[]
  }
  defineProps<Props>()

  const model = defineModel<string>()
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>

    <select
        :id="id"
        v-model="model"
        :required="required"
        class="input-field"
    >
      <option value="" disabled selected hidden>Select an option</option>
      <option v-for="option in options" :key="option" :value="option">
        {{ option }}
      </option>
    </select>
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
</style>
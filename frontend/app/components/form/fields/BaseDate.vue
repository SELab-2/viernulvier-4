<script setup lang="ts">
interface Props {
  label?: string
  id?: string
  required?: boolean
}
defineProps<Props>()

const model = defineModel<string>()
</script>

<template>
  <div class="base-input">
    <label v-if="label" :for="id" class="input-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>

    <div class="date-wrapper">
      <input
          :id="id"
          type="date"
          v-model="model"
          :required="required"
          class="input-field date-input"
      />

      <span class="calendar-icon">📅</span>
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

.date-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  height: 3rem;
  padding: 0 2.5rem 0 0.75rem;
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

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 1.2rem;
}

.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
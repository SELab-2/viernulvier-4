<script setup lang="ts">
  interface Props {
    label?: string
    id?: string
    required?: boolean
    options: string[]
  }
  defineProps<Props>()

  const model = defineModel<string[]>({ default: [] })

  function toggle(value: string) {
    if (model.value.includes(value)) {
      model.value = model.value.filter(v => v !== value)
    } else {
      model.value = [...model.value, value]
    }
  }
</script>

<template>
  <div class="base-checkbox-group">
    <label v-if="label" class="input-label">
      {{ label }} <span v-if="required" class="required-star">*</span>
    </label>

    <div class="checkbox-list">
      <label
          v-for="option in options"
          :key="option"
          class="checkbox-item"
      >
        <input
            type="checkbox"
            :value="option"
            :checked="model.includes(option)"
            @change="toggle(option)"
        />
        <span>{{ option }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
  .base-checkbox-group {
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

  .checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }

  .checkbox-item input {
    width: 1rem;
    height: 1rem;
  }
</style>
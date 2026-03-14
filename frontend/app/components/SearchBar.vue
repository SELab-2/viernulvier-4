<script setup lang="ts">
import { ref, computed } from "vue"
import type { ComputedRef } from "vue"

interface Props {
  modelValue: string
  items: string[]
  limit?: number
  label?: string
  placeholder?: string
  id?: string
  required?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  limit: 5,
  placeholder: "Search...",
})
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const internalQuery = ref(props.modelValue || "")
const selected = ref("")

const results: ComputedRef<string[]> = computed(() => {
  if (!internalQuery.value) return []

  return props.items
      .filter((item) =>
          item.toLowerCase().includes(internalQuery.value.toLowerCase())
      )
      .slice(0, props.limit ?? 5)
})

const select = (item: string) => {
  selected.value = item
  internalQuery.value = ""
  emit("update:modelValue", item)
}
</script>

<template>
  <div class="search-bar">
    <label v-if="props.label" :for="props.id" class="input-label">
      {{ props.label }} <span v-if="props.required" class="required-star">*</span>
    </label>

    <!-- Input field -->
    <input
        :id="props.id"
        type="text"
        :placeholder="props.placeholder"
        v-model="internalQuery"
        :required="props.required"
        class="input-field"
    />

    <ul v-if="results.length" class="suggestions">
      <li v-for="item in results" :key="item" @click="select(item)">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
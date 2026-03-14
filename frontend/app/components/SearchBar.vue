<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { ComputedRef } from "vue"

interface Props {
  modelValue: string
  items: string[]
  limit?: number
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const internalQuery = ref(props.modelValue || "")

watch(internalQuery, (newValue) => {
  emit("update:modelValue", newValue)
})

const results: ComputedRef<string[]> = computed(() => {
  if (!internalQuery.value) return []

  return props.items
      .filter((item) =>
          item.toLowerCase().includes(internalQuery.value.toLowerCase())
      )
      .slice(0, props.limit ?? 5)
})

const select = (item: string) => {
  internalQuery.value = item
}
</script>

<template>
  <div class="search-container">
    <input
        v-model="internalQuery"
        type="text"
        placeholder="Search..."
        class="search-input"
    />

    <ul v-if="results.length" class="suggestions">
      <li
          v-for="item in results"
          :key="item"
          @click="select(item)"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
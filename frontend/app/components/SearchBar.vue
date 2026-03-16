<script setup lang="ts">
/**
 * A reusable search bar component, includes:
 *  - Case-insensitive filtering
 *  - Configurable result limit (default: 5)
 *  - Optional label and required indicator
 *  - Emits selected value via v-model
 *
 * Usage:
 * <SearchBar
 *   v-model="selectedItem"
 *   :items="items"
 *   :limit="3"
 *   label="Select an item"
 *   placeholder="Type to search..."
 * />
 */

import { ref, computed } from "vue"
import type { ComputedRef } from "vue"

interface Props {
  modelValue: string // currently selected value
  items: string[] // list of searchable items
  limit?: number // max suggestions
  label?: string // label displayed above the input
  placeholder?: string // placeholder text displayed inside the input
  id?: string
  required?: boolean // adds a "*" if required
}

const props = withDefaults(defineProps<Props>(), { // default prop values
  limit: 5,
  placeholder: "Search...",
})
const emit = defineEmits<{ // update:modelValue gets called when a new selection is made
  (e: "update:modelValue", value: string): void
}>()

const internalQuery = ref(props.modelValue || "") // so that a user can type without selecting something yet

const results: ComputedRef<string[]> = computed(() => {
  const query = internalQuery.value.toLowerCase()
  const filtered =
      internalQuery.value
        ? props.items.filter((item) => // filtering based on current query
            item.toLowerCase().includes(query)
        )
        : props.items // all items when nothing is typed in, to give some suggestions

  const sorted = filtered.sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(query)
    const bStarts = b.toLowerCase().startsWith(query)
    if (aStarts && !bStarts) return -1 // a starts with current input, b doesn't
    if (!aStarts && bStarts) return 1 // b starts with current input, a doesn't
    return a.localeCompare(b) // if neither start with current input, sort alphabetically
  })

  return sorted.slice(0, props.limit ?? 5)
})

const select = (item: string) => { // handles selecting a suggestion
  internalQuery.value = ""
  emit("update:modelValue", item)
}
//TODO add language support, add css
</script>

<template>
  <div class="search-bar">
    <!-- Optional label -->
    <label v-if="props.label" :for="props.id" class="input-label">
      {{ props.label }} <span v-if="props.required" class="required-star">*</span>
    </label>

    <br>

    <!-- Search input based on internalQuery -->
    <input
        :id="props.id"
        type="text"
        :placeholder="props.placeholder"
        v-model="internalQuery"
        :required="props.required"
        class="input-field"
    />

    <!-- Autocompletion suggestions -->
    <ul v-if="results.length" class="suggestions">
      <li v-for="item in results" :key="item" @click="select(item)">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
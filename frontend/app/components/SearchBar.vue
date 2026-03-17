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
import { Search } from "lucide-vue-next"

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
const isFocused = ref(false) // tracks if input is focused (user is typing)

const results: ComputedRef<string[]> = computed(() => {
  // suggestions do not need to appear if user did not click on the bar
  // and if the bar is empty just after selecting anything
  if (!isFocused.value && !internalQuery.value) return []

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
  isFocused.value = false
}
const hideSuggestions = () => {
  setTimeout(() => {
    isFocused.value = false
  }, 150)
}
//TODO lang support
</script>

<template>
  <div class="search-bar">
    <!-- Optional label -->
    <label v-if="props.label" :for="props.id" class="input-label">
      {{ props.label }} <span v-if="props.required" class="required-star">*</span>
    </label>

    <div class="relative">
      <!-- Search input based on internalQuery -->
      <input
          :id="props.id"
          type="text"
          :placeholder="props.placeholder"
          v-model="internalQuery"
          :required="props.required"
          @focus="isFocused = true"
          @blur="hideSuggestions"
          class="pl-12 bg-zinc-100 dark:bg-zinc-900 border-none h-12 font-bold uppercase text-[10px] rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <!-- Autocompletion suggestions -->
      <ul v-if="results.length" class="absolute mt-1 w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-lg z-10">
        <li v-for="item in results"
            :key="item"
            @mousedown.prevent="select(item)"
            @click="select(item)"
            class="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700">
          {{ item }}
        </li>
      </ul>

      <!-- Search icon -->
      <Search class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
    </div>
  </div>
</template>

<style scoped>
</style>
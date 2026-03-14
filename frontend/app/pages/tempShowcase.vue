<script setup lang="ts">
import { ref } from "vue"

const mockItems = ref([
  "Apple",
  "Banana",
  "Orange",
  "Mango",
  "Pineapple",
  "Peach",
  "Strawberry",
  "Grapes",
  "Watermelon",
  "Blueberry",
  "Lychee"
])
const searchQuery = ref("")
</script>

<template>
  <div>
    <SearchBar
        v-model="searchQuery"
        :items="mockItems"
        :limit="3"
        label="Select a fruit"
        placeholder="Type a fruit..."
        required
    />
    <p v-if="searchQuery">Selected: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>

</style>
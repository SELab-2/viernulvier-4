<script setup lang="ts">
import { ref } from "vue"
const { locale, setLocale } = useI18n()

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
const searchQuery2 = ref("")
const isDark = ref(false)

const toggleLocale = () => setLocale(locale.value === 'nl' ? 'en' : 'nl')
const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle("dark", isDark.value)
}
</script>

<template>
  <div>
    <SearchBar
        v-model="searchQuery"
        :items="mockItems"
        :limit="4"
        :scroll-limit="3"
        label="Select a fruit"
        placeholder="Type a fruit..."
        required
    />
    <p v-if="searchQuery">Selected: {{ searchQuery }}</p>
  </div>
  <br>
  <!-- extra zoekbalk om i18n the testen -->
  <div>
    <SearchBar
        v-model="searchQuery2"
        :items="mockItems"
        :limit="3"
        label="Zoekbalk om i18n te testen"
    />
    <p v-if="searchQuery2">Selected: {{ searchQuery2 }}</p>
  </div>
  <!-- knop om i18n the testen -->
  <button @click="toggleLocale" class="btn-outline">
    {{ locale.toUpperCase() }}
  </button>
  <br>
  <!-- knop om light-dark the testen -->
  <button @click="toggleDark" class="btn-outline">
    {{ isDark ? "Light" : "Dark" }}
  </button>
</template>

<style scoped>

</style>
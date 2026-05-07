<!-- components/home/HomeSearchBar.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useHomeView } from "~/composables/home/useHomeView";

const { fetchSuggestions } = useHomeView();

const router = useRouter();
const searchQuery = ref("");

// This triggers when the user presses Enter or clicks a suggestion from your SearchBar
function handleSearch(query: string) {
  if (query && query.trim() !== "") {
    router.push({ path: "/productions", query: { q: query.trim() } });
  }
}
</script>

<template>
  <!-- 
    We set the height here (h-16) because your SearchBar uses `h-full`.
    This gives it a prominent, large appearance for the hero section.
  -->
  <div class="relative mx-auto w-full h-14 sm:h-16 shadow-sm">
    <SearchBar
      v-model="searchQuery"
      @update:modelValue="handleSearch"
      :fetchSuggestions="fetchSuggestions"
      :limit="10"
      placeholder="Zoek naar een productie, artiest of thema..."
    />
  </div>
</template>

<!-- components/home/HomeSearchBar.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useHomeView } from "~/composables/home/useHomeView";
import { SearchAssociation, type SearchSuggestion } from "~/types/Search";

const {
  fetchSuggestions,
  applyProductionSearch,
  applyPrintQuery,
  applyBlogQuery,
} = useHomeView();

const router = useRouter();
const searchQuery = ref("");

// This triggers when the user presses Enter or clicks a suggestion from your SearchBar
function handleSelect(item: SearchSuggestion) {
  if (item && item.searchValue) {
    executeSearch(item.searchValue, item.association);
  }
}

// This triggers if someone presses enter without selecting a suggestion.
function handleSearch(query: string) {
  if (query) {
    executeSearch(query);
  }
}

function executeSearch(queryText: string, association?: SearchAssociation) {
  const cleanQuery = queryText.trim();
  if (cleanQuery === "") return;

  // Will route based on selection if there is an association, otherwise go straight to archive page.
  switch (association) {
    case SearchAssociation.Production:
      applyProductionSearch(queryText);
      router.push({ path: ROUTES.productions.base });
      break;
    case SearchAssociation.Blog:
      applyBlogQuery(queryText);
      router.push({ path: ROUTES.stories.base });
      break;
    case SearchAssociation.Print:
      applyPrintQuery(queryText);
      router.push({ path: ROUTES.prints.base });
      break;
    default:
      applyProductionSearch(queryText);
      router.push({ path: ROUTES.productions.base });
      break;
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
      @search="handleSearch"
      @select="handleSelect"
      :fetchSuggestions="fetchSuggestions"
      :limit="5"
      placeholder="Zoek naar een productie, artiest of thema..."
    />
  </div>
</template>

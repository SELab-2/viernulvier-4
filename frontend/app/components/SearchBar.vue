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
 *   :limit="6"
 *   :scrollLimit="3"
 *   label="Select an item"
 *   placeholder="Type to search..."
 * />
 */

import { ref, computed } from "vue";
import type { ComputedRef } from "vue";
import { Search, X } from "lucide-vue-next";
import { useDebounceFn } from "@vueuse/core";
const { t } = useI18n();

interface Props {
  modelValue: string; // currently selected value
  fetchSuggestions: (query: string) => Promise<SearchSuggestion[]>;
  loading?: boolean;
  limit?: number; // max suggestions
  scrollLimit?: number; // number of suggestions before scrollbar appears
  label?: string; // label displayed above the input
  placeholder?: string; // placeholder text displayed inside the input
  id?: string;
  required?: boolean; // adds a "*" if required
}

const props = withDefaults(defineProps<Props>(), {
  // default prop values
  limit: 5,
});
// default value of placeholder cannot be put in withDefaults, as we're working with i18n
const computedPlaceholder = computed(() => {
  return props.placeholder || t("searchbar.placeholder");
});
// computes when a scrollbar should be used
const dropdownStyle = computed(() => {
  const limit = props.scrollLimit ?? props.limit; // is default the same num as max suggestions (there will be no scrollbar then)
  const itemHeightPx = 36; // matches the py-2 height of each <li>
  return { maxHeight: `${limit * itemHeightPx}px` };
});

const emit = defineEmits<{
  // update:modelValue gets called when a new selection is made
  (e: "update:modelValue", value: string): void;
  (e: "search", query: string): void;
}>();

const internalQuery = ref(props.modelValue || ""); // so that a user can type without selecting something yet
const isFocused = ref(false); // tracks if input is focused (user is typing)
const inputRef = ref<HTMLInputElement | null>(null); // used for unfocusing the bar after selecting an item

const select = (item: SearchSuggestion) => {
  // handles selecting a suggestion
  internalQuery.value = item.searchValue;
  emit("update:modelValue", item.searchValue);
  isFocused.value = false; // Remove focus when selected.
  inputRef.value?.blur();
};
const clear = () => {
  // handles clearing the input
  internalQuery.value = "";
  emit("update:modelValue", "");
};
defineExpose({ clear }); // exposes the clear method to the parent components
const submit = () => {
  // handles input when pressing enter
  emit("update:modelValue", internalQuery.value);
  inputRef.value?.blur();
};

/**
 * Suggestions
 */

export interface SearchSuggestion {
  display: string; // The main text shown.
  context?: string; // Secondary text.
  searchValue: string; // The clean text put into the input.
}

const internalResults = ref<SearchSuggestion[]>([]);
const isFetching = ref(false);

const doSearch = useDebounceFn(async (query: string) => {
  if (!props.fetchSuggestions) return;

  if (!query || query.length < 2) {
    internalResults.value = [];
    return;
  }

  isFetching.value = true;

  try {
    internalResults.value = await props.fetchSuggestions(query);
  } catch (error) {
    internalResults.value = [];
  } finally {
    isFetching.value = false;
  }
});

// Watch the internal query for updates.
watch(internalQuery, (newQuery) => {
  doSearch(newQuery);
});
</script>

<template>
  <div class="search-bar h-full">
    <!-- Optional label -->
    <label
      v-if="props.label"
      :for="props.id"
      class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block"
    >
      {{ props.label }}
      <span v-if="props.required" class="text-red-500">*</span>
    </label>

    <div class="relative h-full">
      <!-- Search input based on internalQuery -->
      <input
        ref="inputRef"
        :id="props.id"
        type="text"
        :placeholder="computedPlaceholder"
        v-model="internalQuery"
        :required="props.required"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @keydown.enter="submit"
        class="pl-12 pr-10 bg-muted border border-border h-full font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90"
      />

      <!-- Autocompletion suggestions -->
      <ul
        v-if="isFocused && internalResults.length"
        :style="dropdownStyle"
        class="absolute mt-1 w-full bg-background border border-border rounded-lg shadow-2xl z-10 overflow-y-auto"
      >
        <li
          v-for="(item, index) in internalResults"
          :key="index"
          @mousedown.prevent="select(item)"
          class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-muted text-muted-foreground overflow-hidden truncate"
        >
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate"
          >
            {{ item.display }}
          </span>

          <span
            v-if="item.context"
            class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 ml-2 shrink-0"
          >
            {{ item.context }}
          </span>
        </li>
      </ul>

      <!-- Search icon -->
      <Search
        class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />

      <!-- Clear button -->
      <button
        v-if="internalQuery"
        @mousedown.prevent="clear"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>

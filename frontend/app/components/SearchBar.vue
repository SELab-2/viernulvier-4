<script setup lang="ts">
/**
 * A reusable search bar component, includes:
 *  - Case-insensitive filtering
 *  - Configurable result limit (default: 5)
 *  - Optional label and required indicator
 *  - Emits selected value via v-model
 *  - Arrow key navigation through suggestions
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
import { Search, X } from "lucide-vue-next";
import { useDebounceFn } from "@vueuse/core";
import type { SearchSuggestion } from "~/types/Search";
const { t } = useI18n();

/**
 * Definition of props.
 */

interface Props {
  modelValue: string; // currently selected value
  fetchSuggestions?: (
    query: string,
    limit: number,
  ) => Promise<SearchSuggestion[]>;
  suggestions?: SearchSuggestion[]; // Optional array of suggestions.
  limit: number; // How many suggestions to fetch.
  scrollLimit?: number; // number of suggestions before scrollbar appears
  label?: string; // label displayed above the input
  placeholder?: string; // placeholder text displayed inside the input
  id?: string;
  required?: boolean;
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
  (e: "update:modelValue", value: string): void;
  (e: "search", query: string): void;
  (e: "select", item: SearchSuggestion): void; // Emits the whole object.
}>();

const internalQuery = ref(props.modelValue || "");
const isFocused = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

// ── Arrow-key navigation ────────────────────────────────────────────────────
const highlightedIndex = ref(-1); // -1 means nothing highlighted
const listRef = ref<HTMLUListElement | null>(null); // ref to the <ul> for scrollIntoView

/** Move highlight up/down, clamped to list bounds. */
const moveHighlight = (direction: 1 | -1) => {
  if (!internalResults.value.length) return;
  highlightedIndex.value = Math.max(
    -1,
    Math.min(
      internalResults.value.length - 1,
      highlightedIndex.value + direction,
    ),
  );
  // Scroll the highlighted <li> into view if the dropdown has a scrollbar
  nextTick(() => {
    const li = listRef.value?.children[highlightedIndex.value] as
      | HTMLElement
      | undefined;
    li?.scrollIntoView({ block: "nearest" });
  });
};
// ───────────────────────────────────────────────────────────────────────────

const select = (item: SearchSuggestion) => {
  internalQuery.value = item.searchValue;
  emit("update:modelValue", item.searchValue);
  emit("select", item);
  isFocused.value = false;
  highlightedIndex.value = -1; // reset on selection
  inputRef.value?.blur();
};

const clear = () => {
  internalQuery.value = "";
  emit("update:modelValue", "");
};
defineExpose({ clear });

/** Enter key: select highlighted item if one exists, otherwise plain submit. */
const submit = () => {
  const highlighted = internalResults.value[highlightedIndex.value];
  if (highlighted) {
    select(highlighted);
  } else {
    emit("update:modelValue", internalQuery.value);
    emit("search", internalQuery.value);
    inputRef.value?.blur();
  }
};

/**
 * Suggestions
 */

/**
 * The internal list of suggestions fetched.
 */
const internalResults = ref<SearchSuggestion[]>([]);
const isFetching = ref(false);

/**
 * Executes a single search over the suggestion possibilities.
 * @param query The query to search for.
 */
const executeSearch = async (query: string) => {
  highlightedIndex.value = -1; // reset highlight whenever results refresh

  if (!props.fetchSuggestions) {
    const lowerQuery = query.toLowerCase();
    internalResults.value = (props.suggestions ?? []).filter((item) =>
      item.display.toLowerCase().includes(lowerQuery),
    );
    return;
  }

  // We only fetch results if the string is longer than 2.
  if (!query || query.length < 2) {
    internalResults.value = [];
    return;
  }

  isFetching.value = true;
  try {
    internalResults.value = await props.fetchSuggestions(query, props.limit);
  } catch {
    internalResults.value = [];
  } finally {
    isFetching.value = false;
  }
};

const debouncedSearch = useDebounceFn(executeSearch, 100);

// Watch the internal query for updates.
watch(internalQuery, (newQuery) => {
  if (!newQuery) {
    emit("update:modelValue", "");
    emit("search", "");
  }

  // Add delay for async based on if a function was passed.
  if (props.fetchSuggestions) {
    debouncedSearch(newQuery);
  } else {
    executeSearch(newQuery);
  }
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
        :required="required"
        @focus="
          isFocused = true;
          executeSearch(internalQuery);
        "
        @blur="
          isFocused = false;
          highlightedIndex = -1;
        "
        @keydown.enter.prevent="submit"
        @keydown.down.prevent="moveHighlight(1)"
        @keydown.up.prevent="moveHighlight(-1)"
        class="pl-12 pr-10 bg-muted border border-border h-full font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90"
      />

      <!-- Autocompletion suggestions -->
      <ul
        v-if="isFocused && internalResults.length"
        ref="listRef"
        :style="dropdownStyle"
        class="absolute mt-1 w-full bg-background border border-border rounded-lg shadow-2xl z-10 overflow-y-auto"
      >
        <li
          v-for="(item, index) in internalResults"
          :key="index"
          @mousedown.prevent="select(item)"
          :class="[
            'px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground overflow-hidden truncate',
            index === highlightedIndex ? 'bg-muted' : 'hover:bg-muted',
          ]"
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

      <Search
        class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />

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

<script setup lang="ts">
/**
 * A reusable multi-select component, includes:
 *  - Optional label
 *  - Required indicator
 *  - Searchable options via SearchBar
 *  - Single or multiple selection (default single)
 *  - Allows values other than given values (default false)
 *  - Binds selected value(s) via v-model
 *
 * Usage:
 * <BaseMultiSelect
 *   v-model="selected"
 *   :options="['Option A', 'Option B', 'Option C']"
 *   label="Category"
 *   multiple
 *   required
 * />
 */

import { ref } from "vue";
import { X } from "lucide-vue-next";

interface Props {
  label?: string; // label displayed above the field
  id?: string;
  required?: boolean; // adds a "*" if required
  options: string[]; // options where can be selected from
  multiple?: boolean; // if multiple options can be selected
  placeholder?: string; // placeholder text displayed inside the field
  freeInput?: boolean; // allows values outside of given options
}
const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  freeInput: false,
});

const model = defineModel<string[]>({ default: [] });
const searchQuery = ref("");

const searchBarRef = ref();

function handleSelect(value: string) {
  // handles selecting an item
  if (!value) return;
  if (!props.freeInput && !props.options.includes(value)) return; // reject if not in options
  if (props.multiple) {
    if (!model.value.includes(value)) {
      model.value = [...model.value, value];
    }
  } else {
    model.value = [value];
  }
  searchBarRef.value?.clear(); // clear search after selecting
}

function removeItem(item: string) {
  // handles removing an item
  model.value = model.value.filter((i) => i !== item);
}

// filters out already selected items from suggestions
const availableOptions = computed(() =>
  props.options.filter((o) => !model.value.includes(o)),
);

function clear() {
  model.value = [];
  searchQuery.value = "";
  searchBarRef.value?.clear();
}

defineExpose({ clear }); // exposes a clear method to the parent components
</script>

<template>
  <div class="m-4">
    <!-- Optional label -->
    <label
      v-if="label"
      :for="id"
      class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block"
    >
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- SearchBar -->
    <div class="-mx-4">
      <SearchBar
        ref="searchBarRef"
        v-model="searchQuery"
        :results="availableOptions"
        :placeholder="placeholder"
        :id="id"
        @update:modelValue="handleSelect"
      />
    </div>

    <!-- Selected items -->
    <div
      v-if="model.length"
      data-testid="item-container"
      class="mt-2 border border-border rounded-lg overflow-hidden"
    >
      <!-- testid to make it easier for testing -->
      <div
        v-for="item in model"
        :key="item"
        class="flex items-center justify-between px-4 h-10 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors duration-150 hover:bg-muted border-b border-border last:border-b-0"
      >
        <span class="truncate mr-4">{{ item }}</span>
        <X
          class="w-3 h-3 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          @click="removeItem(item)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>

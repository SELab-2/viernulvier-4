<script setup lang="ts">
/**
 * A reusable select dropdown component, includes:
 *  - Optional label
 *  - Required indicator
 *  - Configurable list of options
 *  - Binds selected value via v-model
 *
 * Usage:
 * <BaseSelect
 *   v-model="selectedOption"
 *   :options="['Option A', 'Option B', 'Option C']"
 *   label="Category"
 *   required
 * />
 */

import { ChevronDown } from "lucide-vue-next";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label?: string; // label displayed above the field
  id?: string;
  required?: boolean; // adds a "*" if required
  options: string[] | Option[]; // options where can be selected from
}
defineProps<Props>();

const model = defineModel<string>();
</script>

<template>
  <div class="m-4">
    <!-- Optional Label -->
    <label
      v-if="label"
      :for="id"
      class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block"
    >
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Select field -->
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :required="required"
        :class="[
          'px-4 bg-muted border border-border h-12 font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none hover:border-accent hover:bg-muted/70 focus:border-foreground/30 focus:bg-background appearance-none cursor-pointer pr-10',
          model ? 'text-foreground' : 'text-muted-foreground',
        ]"
      >
        <option value="" disabled selected hidden>Select an option</option>
        <option
          v-for="option in options"
          :key="typeof option === 'string' ? option : option.value"
          :value="typeof option === 'string' ? option : option.value"
        >
          {{ typeof option === "string" ? option : option.label }}
        </option>
      </select>

      <!-- Chevron icon -->
      <ChevronDown
        class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
      />
    </div>
  </div>
</template>

<style scoped></style>

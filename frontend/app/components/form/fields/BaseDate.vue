<script setup lang="ts">
/**
 * A reusable date picker component, includes:
 *  - Optional label
 *  - Required indicator
 *  - Selecting date from calendar popup or typing it in
 *  - Binds value via v-model
 *
 * Usage:
 * <BaseDate
 *   v-model="dueDate"
 *   label="Due Date"
 *   required
 * />
 */
import { Calendar } from "lucide-vue-next";

interface Props {
  label?: string; // label displayed above the field
  id?: string;
  required?: boolean; // adds a "*" if required
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

    <!-- Date Picker Field -->
    <div class="relative">
      <input
        :id="id"
        type="date"
        v-model="model"
        :required="required"
        :class="[
          'px-4 bg-muted border border-border h-12 font-bold text-[10px] tracking-widest rounded-lg w-full outline-none hover:border-accent hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90',
          model ? 'text-foreground' : 'text-muted-foreground',
        ]"
      />

      <!-- Calendar icon -->
      <Calendar
        class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />
    </div>
  </div>
</template>

<style scoped></style>

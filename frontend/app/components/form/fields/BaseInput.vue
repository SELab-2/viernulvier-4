<script setup lang="ts">
/**
 * A reusable input field, includes:
 *  - Optional label and placeholder
 *  - Supports text and number inputs (default: text)
 *  - Required indicator
 *  - Binds value via v-model
 *
 * Usage:
 * <BaseInput
 *   v-model="title"
 *   label="Title"
 *   placeholder="Enter title"
 *   required
 * />
 */

interface Props {
  label?: string; // label displayed above the field
  placeholder?: string; // placeholder text displayed inside the field
  type?: "text" | "number"; // input accepts either text, or a number
  id?: string;
  required?: boolean; // adds a "*" if required
}
withDefaults(defineProps<Props>(), {
  type: "text",
});

const model = defineModel<string | number>();
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

    <!-- Input field -->
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      v-model="model"
      :required="required"
      class="px-4 bg-muted border border-border h-12 font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground placeholder:opacity-100 dark:placeholder:opacity-90"
    />
  </div>
</template>

<style scoped></style>

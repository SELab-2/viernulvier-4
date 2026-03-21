<script setup lang="ts">
/**
 * A reusable textarea field, includes:
 *  - Optional label and placeholder
 *  - Configurable number of rows (default: 5)
 *  - Required indicator
 *  - Binds value via v-model
 *
 * Usage:
 * <BaseTextArea
 *   v-model="description"
 *   label="Description"
 *   placeholder="Enter description"
 *   :rows="3"
 *   required
 * />
 */
interface Props {
  label?: string // label displayed above the field
  placeholder?: string // placeholder text displayed inside the field
  id?: string
  required?: boolean // adds a "*" if required
  rows?: number // amount of rows, determines the height of the field
}
withDefaults(defineProps<Props>(), {
  rows: 5
})

const model = defineModel<string>()
</script>

<template>
  <!-- Optional Label -->
  <div class="m-4">
    <label v-if="label" :for="id" class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Text area field -->
    <textarea
        :id="id"
        :placeholder="placeholder"
        v-model="model"
        :required="required"
        :rows="rows"
        class="px-4 py-3 bg-muted border border-border font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background resize-none"
    />
  </div>
</template>

<style scoped>
</style>
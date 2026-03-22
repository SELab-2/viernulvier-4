<script setup lang="ts">
/**
 * A reusable tag input component, includes:
 *  - Optional label
 *  - Required indicator
 *  - Add tags by pressing Enter
 *  - Duplicate tags are ignored
 *  - Remove tags by clicking the X button
 *  - Binds value via v-model
 *
 * Usage:
 * <BaseTagInput
 *   v-model="tags"
 *   label="Tags"
 *   placeholder="Add tags"
 *   required
 * />
 */

import { X } from 'lucide-vue-next'

interface Props {
  label?: string // label displayed above the field
  placeholder?: string // placeholder text displayed inside the field
  id?: string
  required?: boolean // adds a "*" if required
}
defineProps<Props>()

const model = defineModel<string[]>({ default: [] })
const inputText = ref('')

function addTag() {
  const value = inputText.value.trim()
  if (value && !model.value.includes(value)) { // only add the tag if it doesn't exist already
    model.value.push(value)
  }
  inputText.value = '' // clearing text input
}

function removeTag(tag: string) { // handles removing the tag
  model.value = model.value.filter(t => t !== tag)
}

function handleKey(event: KeyboardEvent) { // handles pressing enter
  if (event.key === 'Enter') { // manual check if enter was the button that was pressed
    event.preventDefault()
    addTag()
  }
}
</script>

<template>
  <div class="m-4">
    <!-- Optional Label -->
    <label v-if="label" :for="id" class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input field -->
    <input
        :id="id"
        type="text"
        :placeholder="placeholder"
        v-model="inputText"
        @keydown="handleKey"
        class="px-4 bg-muted border border-border h-12 font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background placeholder:text-muted-foreground"
    />

    <!-- Added tags -->
    <div v-if="model.length" data-testid="tag-container" class="flex flex-wrap gap-2 mt-2"> <!-- testid to make it easier for testing -->
      <span
          v-for="tag in model"
          :key="tag"
          class="flex items-center gap-1 px-2 py-1 bg-background border border-border rounded-md text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors duration-150 hover:bg-muted hover:border-foreground/20 min-w-0 max-w-full"
      >
        <span class="truncate">{{ tag }}</span>
        <X class="w-3 h-3 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" @click.stop="removeTag(tag)" />
      </span>
    </div>
  </div>
</template>

<style scoped>
</style>
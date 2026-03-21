<script setup lang="ts">
/**
 * A reusable file upload component, includes:
 *  - Optional label
 *  - Required indicator
 *  - Single or multiple file selection (default singular files)
 *  - Accepts specific file types via accept prop (default no restriction)
 *  - Selected filenames displayed below the input
 *  - Binds File objects via v-model
 *
 * Usage:
 * <BaseFileUpload
 *   v-model="attachment"
 *   label="Attachment"
 *   accept=".pdf,.png"
 *   multiple
 *   required
 * />
 */

import { Paperclip, X } from 'lucide-vue-next'

interface Props {
  label?: string // label displayed above the field
  id?: string
  required?: boolean // adds a "*" if required
  accept?: string // accepted file types
  multiple?: boolean // if multiple files are accepted
}
const props = withDefaults(defineProps<Props>(), {
  accept: '',
  multiple: false
})

const model = defineModel<File[]>({
  default: [] as File[]
}) // model holds list of selected files

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const newFiles  = Array.from(target.files)
  if (props.multiple) { // case where multiple files are allowed
    const existing = model.value.map(f => f.name)
    const toAdd = newFiles.filter(f => !existing.includes(f.name))
    model.value = [...model.value, ...toAdd]
  } else { // case where only one file is allowed
    model.value = newFiles.length > 0 ? [newFiles[0]!] : [] // ! to tell ts that it is not undefined
  }
  target.value = '' // resetting input
}

function removeFile(index: number) { // handles removing a file
  model.value = model.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="m-4">
    <!-- Optional Label -->
    <label v-if="props.label" :for="props.id" class="text-[12px] font-bold uppercase text-muted-foreground mb-1 block">
      {{ props.label }} <span v-if="props.required" class="text-red-500">*</span>
    </label>

    <!-- File input -->
    <div class="relative flex items-center">
      <input
          :id="props.id"
          type="file"
          :required="props.required"
          :accept="props.accept"
          :multiple="props.multiple"
          @change="handleFileChange"
          class="pl-10 pr-4 bg-muted border border-border h-12 leading-[3rem] font-bold uppercase text-[10px] tracking-widest rounded-lg w-full outline-none transition-colors duration-150 hover:border-foreground/20 hover:bg-muted/70 focus:border-foreground/30 focus:bg-background file:hidden cursor-pointer"
      />

      <!-- Paperclip icon -->
      <Paperclip class="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>

    <!-- Selected files -->
    <div v-if="model.length" class="mt-2 border border-border rounded-lg overflow-hidden">
      <div
          v-for="(file, index) in model"
          :key="file.name"
          class="flex items-center justify-between px-4 h-10 text-[10px] font-bold uppercase tracking-widest text-foreground transition-colors duration-150 hover:bg-muted border-b border-border last:border-b-0"
      >
        <span class="truncate mr-4">{{ file.name }}</span>
        <X class="w-3 h-3 shrink-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" @click="removeFile(index)" />
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
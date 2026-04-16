<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next";

const props = defineProps<{
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: "go-to-page", page: number): void;
}>();

// constants
const chevronButton =
  "w-9 h-9 flex items-center justify-center rounded border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors disabled:opacity-0 disabled:cursor-default";
</script>

<template>
  <div class="flex items-center justify-center gap-2 mt-6 h-9">
    <button
      :class="chevronButton"
      :disabled="page === 0"
      @click="emit('go-to-page', page - 1)"
    >
      <ChevronLeft :size="16" />
    </button>

    <span
      v-if="totalPages > 1"
      class="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2"
    >
      {{ page + 1 }} / {{ totalPages }}
    </span>

    <button
      :class="chevronButton"
      :disabled="page === totalPages - 1"
      @click="emit('go-to-page', page + 1)"
    >
      <ChevronRight :size="16" />
    </button>
  </div>
</template>

<style scoped></style>

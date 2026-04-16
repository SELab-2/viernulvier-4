<script setup lang="ts">
/**
 * Reusable delete action button.
 * Wraps ActionButton with a red style and trash icon.
 */
import { Trash2 } from "lucide-vue-next";

interface Props {
  label: string;
  size?: number;
  mode?: "icon" | "text";
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
  mode: "icon",
});

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <button
    v-if="props.mode === 'text'"
    type="button"
    :aria-label="label"
    class="text-xs font-semibold uppercase tracking-widest text-action-red-icon hover:text-action-red-text-hover [&:hover]:transition-colors [&:hover]:duration-150"
    @click="emit('click')"
  >
    {{ label }}
  </button>

  <!-- Red delete action button -->
  <AdminActionButton
    v-else
    :label="label"
    :size="props.size"
    variant="red"
    @click="emit('click')"
  >
    <!-- Delete icon inherits the computed size from ActionButton -->
    <template #default="{ iconSize }">
      <Trash2 :size="iconSize" />
    </template>
  </AdminActionButton>
</template>

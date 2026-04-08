<script setup lang="ts">
/**
 * Reusable delete action button.
 * Wraps ActionButton with a red style and trash icon.
 */
import { Trash2 } from "lucide-vue-next";
import ActionButton from "./ActionButton.vue";

interface Props {
  label: string;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
});

const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<template>
  <!-- Red delete action button -->
  <ActionButton
    :label="label"
    :size="props.size"
    variant="red"
    @click="emit('click')"
  >
    <!-- Delete icon inherits the computed size from ActionButton -->
    <template #default="{ iconSize }">
      <Trash2 :size="iconSize" />
    </template>
  </ActionButton>
</template>

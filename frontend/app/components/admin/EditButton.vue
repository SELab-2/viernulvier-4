<script setup lang="ts">
/**
 * Reusable edit action button.
 * Wraps ActionButton with a blue style and edit icon.
 */
import { Edit2 } from "lucide-vue-next";

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
  <!-- Blue edit action button -->
  <AdminActionButton
    :label="label"
    :size="props.size"
    variant="blue"
    @click="emit('click')"
  >
    <!-- Edit icon inherits the computed size from ActionButton -->
    <template #default="{ iconSize }">
      <Edit2 :size="iconSize" />
    </template>
  </AdminActionButton>
</template>

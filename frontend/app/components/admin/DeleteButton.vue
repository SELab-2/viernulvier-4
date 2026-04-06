<script setup lang="ts">
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
  <ActionButton
    :label="label"
    :size="props.size"
    variant="red"
    @click="emit('click')"
  >
    <template #default="{ iconSize }">
      <Trash2 :size="iconSize" />
    </template>
  </ActionButton>
</template>

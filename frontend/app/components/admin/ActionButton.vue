<script setup lang="ts">
/**
 * Base reusable action button for admin list actions.
 *
 * Supports:
 *  - Numeric size in pixels
 *  - Color variants (blue, red, green, gray)
 *  - Icon slot for full flexibility (edit, delete, upload, ...)
 */
type ActionButtonVariant = "blue" | "red" | "green" | "gray" | "warning";

interface Props {
  label: string;
  size?: number;
  variant?: ActionButtonVariant;
}

const props = withDefaults(defineProps<Props>(), {
  size: 44,
  variant: "gray",
});

const emit = defineEmits<{
  (e: "click"): void;
}>();

const buttonBaseClass =
  "p-0 flex items-center justify-center rounded-md border-2 transition-colors duration-150";

const variantClasses: Record<ActionButtonVariant, string> = {
  blue: "border-action-blue-border text-action-blue-icon hover:bg-action-blue-hover",
  red: "border-action-red-border text-action-red-icon hover:bg-action-red-hover",
  green:
    "border-action-green-border text-action-green-icon hover:bg-action-green-hover",
  gray: "border-action-gray-border text-action-gray-icon hover:bg-action-gray-hover",
  warning:
    "border-action-warning-border text-action-warning-icon hover:bg-action-warning-hover",
  // add more variants as needed
};

const iconSizeFromButton = (size: number) => Math.round(size * 0.45);
</script>

<template>
  <button
    type="button"
    :class="`${buttonBaseClass} ${variantClasses[props.variant]}`"
    :style="{ width: `${props.size}px`, height: `${props.size}px` }"
    :aria-label="label"
    @click="emit('click')"
  >
    <slot :icon-size="iconSizeFromButton(props.size)" />
  </button>
</template>

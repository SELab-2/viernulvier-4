<script setup lang="ts">
/**
 * Base reusable action button for admin list actions.
 *
 * Supports:
 *  - Numeric size in pixels
 *  - Color variants (blue, red, green, gray)
 *  - Icon slot for full flexibility (edit, delete, upload, ...)
 */
type ActionButtonVariant = "blue" | "red" | "green" | "gray";

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
  blue: "border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900",
  red: "border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900",
  green:
    "border-green-200 text-green-600 hover:bg-green-50 dark:hover:bg-green-900",
  gray: "border-gray-300 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800",
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

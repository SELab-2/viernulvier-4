<!--
  components/prints/PrintsDisplay.vue
  ====================================
  Groups prints per category
-->

<script setup lang="ts">
import type { PrintItemView, PrintType } from "@repo/common";
import { PrintTypeValues } from "@repo/common";

interface Props {
  prints: PrintItemView[];
  activeType: string;
}

const props = defineProps<Props>();

const categories = computed(() => {
  const category = Object.fromEntries(
    PrintTypeValues.map((t) => [t, [] as PrintItemView[]]),
  ) as Record<PrintType, PrintItemView[]>;

  props.prints.forEach((print) => {
    category[print.print_type]?.push(print);
  });

  return category;
});

const categoryEntries = computed(() => {
  const entries = Object.entries(categories.value) as [
    PrintCategory,
    PrintItemView[],
  ][];
  return entries.filter(
    ([category, files]) => files.length > 0 && props.activeType === category,
  );
});
</script>

<template>
  <div class="space-y-16">
    <PrintsFileGrid
      v-for="[category, files] in categoryEntries"
      :key="category"
      :category="category"
      :files="files"
    />
  </div>
</template>

<style scoped></style>

<!--
  components/prints/PrintsDisplay.vue
  ====================================
  Groups prints per category
-->

<script setup lang="ts">
import type { PrintItemView } from "@repo/common";

type PrintCategory = "AFFICHE" | "BROCHURE" | "DRUKWERK" | "PROGRAMMA"; //TODO probably needs to be changed later on

interface Props {
  prints: PrintItemView[];
  activeType: string;
}

const props = defineProps<Props>();

const categories = computed(() => {
  const category: Record<PrintCategory, PrintItemView[]> = {
    AFFICHE: [],
    BROCHURE: [],
    DRUKWERK: [],
    PROGRAMMA: [],
  }; //TODO probably needs to be changed later on

  props.prints.forEach((print) => {
    const titelUpper = print.titel.toUpperCase();
    if (titelUpper.includes("AFFICHE")) category.AFFICHE.push(print);
    else if (titelUpper.includes("BROCHURE")) category.BROCHURE.push(print);
    else if (titelUpper.includes("DRUKWERK")) category.DRUKWERK.push(print);
    else if (titelUpper.includes("PROGRAMMA")) category.PROGRAMMA.push(print);
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

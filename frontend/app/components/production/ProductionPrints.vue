<script setup lang="ts">
/**
 * Component to show related prints on production detail page
 */

import { computed } from "vue";
import type { PrintItemView, Language } from "@repo/common";

interface Props {
  productionId: number;
}

const props = defineProps<Props>();

const { t, locale } = useI18n();
const { getPrintsGallery } = useProductionApi();

/**
 * Get the prints gallery for this production
 */
const { data: galleryData, status } = useAsyncData(
  `prod-prints-${props.productionId}-${locale.value}`,
  async () => {
    if (!props.productionId) return null;
    const res = await getPrintsGallery(
      props.productionId,
      locale.value as Language,
    );
    return (res as any)?.data ?? res;
  },
  { watch: [() => props.productionId, locale] },
);

/**
 * Sort prints
 */
const allPrints = computed<PrintItemView[]>(() => {
  if (!galleryData.value || !galleryData.value.items) return [];

  return [...galleryData.value.items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
});

const hasPrints = computed(() => allPrints.value.length > 0);
</script>

<template>
  <div v-if="status === 'success' && hasPrints" class="w-full">
    <h2 class="subtitle mb-6">
      {{ t("production.prints") }}
    </h2>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 items-start"
    >
      <PrintsFileGridItem
        v-for="file in allPrints"
        :key="file.id"
        :file="file"
      />
    </div>
  </div>
</template>

<style scoped></style>

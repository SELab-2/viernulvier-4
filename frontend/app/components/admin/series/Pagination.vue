<!--
  AdminSeriesPagination.vue
  ===========================
  Smart wrapper for series management pagination, tied to useSeriesView.
  Includes both the page jumper and the pagination nav.
-->
<script setup lang="ts">
import { useSeriesView } from "~/composables/useSeriesView";

const { currentPage, totalPages, loading } = useSeriesView();
</script>

<template>
  <div class="flex items-center justify-between w-full">
    <SharedBasePageJumper
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :loading="loading"
    />
    <SharedBasePagination
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :loading="loading"
    />
  </div>
</template>

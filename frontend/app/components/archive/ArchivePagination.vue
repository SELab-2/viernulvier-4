<!--
ArchivePagination.vue

Smart wrapper for BasePagination, tied to useArchiveView.
-->
<script setup lang="ts">
import { useArchiveView } from "../../composables/useArchiveView";

const { currentPage, totalPages, loading } = useArchiveView();
</script>

<template>
  <SharedBasePagination
    v-model:current-page="currentPage"
    :total-pages="totalPages"
    :loading="loading"
  />
</template>

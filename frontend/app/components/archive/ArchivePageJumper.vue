<!--
ArchivePageJumper.vue

Smart wrapper for BasePageJumper, tied to useArchiveView.
-->
<script setup lang="ts">
import { useArchiveView } from "../../composables/useArchiveView";

const { currentPage, totalPages, loading } = useArchiveView();
</script>

<template>
  <SharedBasePageJumper
    v-model:current-page="currentPage"
    :total-pages="totalPages"
    :loading="loading"
  />
</template>

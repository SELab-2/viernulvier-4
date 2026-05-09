<script setup lang="ts">
import type { ParserTarget } from "~/composables/useParserApi";

const props = defineProps<{ target: ParserTarget }>();
</script>

<template>
  <div class="space-y-6">
    <AdminCsvTemplateDownload :target="props.target" />
    <AdminCsvUploadComponent :target="props.target" />
  </div>
</template>

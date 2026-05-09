<script setup lang="ts">
import { ref } from "vue";
import type { ParserTarget } from "~/composables/useParserApi";

const selected = ref<ParserTarget>("productions");
const targets: ParserTarget[] = [
  "productions",
  "events",
  "tags",
  "blogs",
  "prices",
];
</script>

<template>
  <div class="max-w-3xl mx-auto py-10 space-y-6">
    <h1 class="text-2xl font-bold">CSV Import / Export Showcase</h1>

    <div class="flex items-center gap-4">
      <label class="font-semibold">Select target:</label>
      <select v-model="selected" class="rounded border px-3 py-1">
        <option v-for="t in targets" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <AdminCsvImportCard :target="selected" />
  </div>
</template>

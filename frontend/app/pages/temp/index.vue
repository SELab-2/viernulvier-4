<script setup lang="ts">
import { height } from "happy-dom/lib/PropertySymbol";
import { ref } from "vue";
// Note: If you put BaseMultiSelect in your `~/components` directory,
// Nuxt will auto-import it and you don't need this import line!
import BaseMultiSelect from "~/components/form/fields/BaseMultiSelect.vue";

// --- State ---
// Your component defines the model as a string array: defineModel<string[]>({ default: [] })
const favoriteFruit = ref<string[]>([]);
const techStack = ref<string[]>([]);

// --- Options Data ---

// Example 1: Simple strings (Your component will normalize these into objects automatically)
const fruitOptions = [
  "Apple",
  "Banana",
  "Orange",
  "Mango",
  "Pineapple",
  "Strawberry",
];

// Example 2: Strict objects using your SearchSuggestion interface
const frameworkOptions = [
  { display: "Vue.js", searchValue: "Vue.js", context: "Frontend" },
  { display: "Nuxt.js", searchValue: "Nuxt.js", context: "Fullstack" },
  { display: "React", searchValue: "React", context: "Frontend" },
  { display: "Tailwind CSS", searchValue: "Tailwind CSS", context: "Styling" },
  { display: "PostgreSQL", searchValue: "PostgreSQL", context: "Database" },
];
</script>

<template>
  <div class="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6">
    <div class="max-w-2xl mx-auto space-y-12">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-widest mb-2">
          Component Sandbox
        </h1>
        <p class="text-muted-foreground text-sm">
          Testing the BaseMultiSelect implementations.
        </p>
      </div>

      <section class="p-6 border border-border rounded-xl bg-card shadow-sm">
        <h2
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2"
        >
          1. Single Select (String Array)
        </h2>

        <BaseMultiSelect
          v-model="favoriteFruit"
          :options="fruitOptions"
          label="Favorite Fruit"
          placeholder="Search for a fruit..."
          required
        />

        <div
          class="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50 font-mono text-xs"
        >
          <span class="text-muted-foreground font-bold"
            >State (favoriteFruit):</span
          >
          {{ favoriteFruit }}
        </div>
      </section>

      <section class="p-6 border border-border rounded-xl bg-card shadow-sm">
        <h2
          class="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 border-b border-border pb-2"
        >
          2. Multi Select (Object Array)
        </h2>

        <BaseMultiSelect
          v-model="techStack"
          :options="frameworkOptions"
          label="Your Tech Stack"
          placeholder="Search frameworks..."
          multiple
          freeInput
        />

        <div
          class="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50 font-mono text-xs"
        >
          <span class="text-muted-foreground font-bold"
            >State (techStack):</span
          >
          {{ techStack }}
        </div>
      </section>
    </div>
  </div>
</template>

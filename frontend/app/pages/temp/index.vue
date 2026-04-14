<template>
  <div class="p-8 bg-background min-h-screen">
    <PrintsFileGrid category="Archive 2026" :files="tempFiles" />
  </div>
</template>

<script setup lang="ts">
import type { PrintItemView } from "@repo/common";

// Mocking a list of files to see the grid in action
const tempFiles: PrintItemView[] = [
  {
    id: 1,
    titel: "Festival Poster",
    description: "Main event poster",
    url: "/docs/random_doc_1.pdf", // Your local test PDF
    print_type: "affiche",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    titel: "Program Guide",
    description: "Full schedule",
    url: "/docs/random_doc_2.pdf",
    print_type: "brochure",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    titel: "Artist Lineup",
    description: "Experimental",
    url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", // External fallback test
    print_type: "drukwerk",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Add more items here if you want to test the pagination (currently set to 4 rows)
];
</script>

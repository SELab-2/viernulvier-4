<script setup lang="ts">
import testPdf from "@/assets/temp.pdf";
import testPdf2 from "@/assets/temp2.pdf";
import testJpg from "@/assets/temp.jpg";

const files1 = [
  {
    id: 1,
    titel: "AFFICHE-FESTIVAL-2025.PDF",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: testPdf,
  }, // example pdf
  {
    id: 2,
    titel: "AFFICHE-VIDEODROOM-2025.PDF",
    description: "",
    created_at: "2025-01-08T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: testPdf2,
  }, // example pdf
  {
    id: 3,
    titel: "AFFICHE-DE-GRAAL-2025.PDF",
    description: "",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 4,
    titel: "AFFICHE-04.JPG",
    description: "",
    created_at: "2025-03-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 5,
    titel: "AFFICHE-05.JPG",
    description: "",
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
];

const files2 = [
  {
    id: 4,
    titel: "BROCHURE-01.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: testJpg,
  }, // example image
  {
    id: 5,
    titel: "BROCHURE-02.JPG",
    description: "",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 6,
    titel: "BROCHURE-03.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 7,
    titel: "BROCHURE-04.JPG",
    description: "",
    created_at: "2027-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 8,
    titel: "BROCHURE-05.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 9,
    titel: "BROCHURE-06.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 10,
    titel: "BROCHURE-07.JPG",
    description: "",
    created_at: "2028-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 11,
    titel: "BROCHURE-08.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 12,
    titel: "BROCHURE-09.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 13,
    titel: "BROCHURE-10.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 14,
    titel: "BROCHURE-11.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 15,
    titel: "BROCHURE-12.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 16,
    titel: "BROCHURE-13.JPG",
    description: "",
    created_at: "2028-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 17,
    titel: "BROCHURE-14.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 18,
    titel: "BROCHURE-15.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 19,
    titel: "BROCHURE-16.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
  {
    id: 20,
    titel: "BROCHURE-17.JPG",
    description: "",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2026-04-04T00:00:00Z",
    url: "",
  },
];

const files3: never[] = []; // no files
</script>

<template>
  <div class="p-8">
    <PrintsFileGrid category="Affiche" :files="files1" />
  </div>
  <div class="p-8">
    <PrintsFileGrid category="Brochure" :files="files2" />
  </div>
  <div class="p-8">
    <PrintsFileGrid category="Dit is leeg" :files="files3" />
  </div>

  <div class="p-8">
    <PrintsFileList category="Affiche" :files="files1" />
  </div>
  <div class="p-8">
    <PrintsFileList category="Brochure" :files="files2" />
  </div>
  <div class="p-8">
    <PrintsFileList category="Leeg" :files="files3" />
  </div>
</template>

<style scoped></style>

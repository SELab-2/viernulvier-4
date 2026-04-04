<script setup lang="ts">
const files1 = [
  { id: 1, name: 'AFFICHE-FESTIVAL-2025.PDF', year: 2025, image: null },
  { id: 2, name: 'AFFICHE-VIDEODROOM-2025.PDF', year: 2025, image: null },
  { id: 3, name: 'AFFICHE-DE-GRAAL-2025.PDF', year: 2024, image: null },
  { id: 4, name: 'AFFICHE-04.JPG', year: 2025, image: null },
  { id: 5, name: 'AFFICHE-05.JPG', year: 2026, image: null },
]

const files2 = [
  { id: 4, name: 'BROCHURE-01.JPG', year: 2025, image: null },
  { id: 5, name: 'BROCHURE-02.JPG', year: 2026, image: null },
  { id: 6, name: 'BROCHURE-03.JPG', year: 2025, image: null },
  { id: 7, name: 'BROCHURE-04.JPG', year: 2027, image: null },
  { id: 8, name: 'BROCHURE-05.JPG', year: 2025, image: null },
  { id: 9, name: 'BROCHURE-06.JPG', year: 2025, image: null },
  { id: 10, name: 'BROCHURE-07.JPG', year: 2028, image: null },
  { id: 11, name: 'BROCHURE-08.JPG', year: 2025, image: null },
  { id: 12, name: 'BROCHURE-09.JPG', year: 2025, image: null },
  { id: 13, name: 'BROCHURE-10.JPG', year: 2025, image: null },
  { id: 14, name: 'BROCHURE-11.JPG', year: 2025, image: null },
]

const files3: never[] = [] // no files
</script>

<template>
  <h1>Gridview showcase:</h1>
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

<style scoped>
</style>
<!--
  pages/index.vue

  The home page of the VIERNULVIER archive.

  Composed entirely of standalone section components that are auto-imported
  by Nuxt from app/components/home/. The layout (AppHeader + AppFooter) is
  provided by layouts/default.vue and does not need to be included here.

  Section order:
  1. HomeHero       — full-screen hero with title, subtitle and archive CTA
  2. HomeHighlights — grid of recent productions
  3. HomeAbout      — about the archive: text + photo
  4. HomeDiscover   — two large cards linking to Stories and Prints sections
-->

<template>
  <HomeHero />
  <HomeHighlights />
  <HomeAbout />
  <HomeDiscover />
</template>

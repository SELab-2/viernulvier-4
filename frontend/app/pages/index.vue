<template>
  <!-- Home page: composed of standalone section components.
       All section components live in /components and are auto-imported by Nuxt. -->
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white antialiased">

    <!-- Full-screen hero with title, subtitle and archive CTA -->
    <HomeHero />

    <!-- Grid of recent productions (mock data — see HomeHighlights.vue for the TODO) -->
    <HomeHighlights />

    <!-- About the archive: text + photo -->
    <HomeAbout />

    <!-- Two large cards linking to Stories and Posters sections -->
    <HomeDiscover />

    <!-- Shared footer used across all pages -->
    <Footer />

  </div>
</template>
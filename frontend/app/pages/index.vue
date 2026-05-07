<script setup>
definePageMeta({
  layout: "home",
});
</script>

<template>
  <main
    class="w-full relative flex-1 flex flex-col items-center justify-center py-8"
  >
    <div
      class="absolute inset-0 z-0 bg-[url('~/assets/images/archive-grid.jpg')] bg-cover bg-center opacity-10 grayscale"
    ></div>
    <div class="absolute inset-0 z-0 bg-background/80"></div>

    <div
      class="page-container z-10 w-full max-w-4xl flex flex-col items-center justify-center space-y-10"
    >
      <div class="w-full max-w-3xl text-center space-y-5">
        <h1 class="page-header-title tracking-tight">Doorzoek het archief</h1>
        <p class="page-header-subtitle mx-auto opacity-70">
          Vind producties, artikels en herinneringen
        </p>
        <HomeSearchBar />
      </div>

      <div class="w-full relative">
        <div
          class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50"
        ></div>

        <div
          class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 px-4 md:px-8 text-left"
        >
          <HomeRandomTags />
          <HomeRandomYears />
        </div>
      </div>
    </div>
  </main>
</template>

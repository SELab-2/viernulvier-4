<!-- pages/index.vue -->
<template>
  <main
    class="page-container flex min-h-[75vh] flex-col items-center justify-center space-y-12 py-16"
  >
    <!-- Main Search -->
    <div class="w-full max-w-3xl text-center space-y-6">
      <h1 class="page-header-title">Doorzoek het archief</h1>
      <p class="page-header-subtitle mx-auto">
        Vind producties, artikels en herinneringen
      </p>
      <HomeSearchBar />
    </div>

    <!-- Quick Filters (Tags & Years) -->
    <div class="w-full max-w-3xl space-y-8 pt-8 border-t border-border">
      <HomeRandomTags />
      <HomeRandomYears />
    </div>
  </main>
</template>

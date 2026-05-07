<script lang="ts" setup>
// We wrap the error in a function so we can trigger it manually
const crashTheApp = () => {
  showError({
    status: 500,
    statusText: "Internal Server Error",
  });
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] space-y-6">
    <h1 class="text-2xl font-bold">500 Error Test Page</h1>
    <p>
      If the error page is working, clicking this button will summon the goats.
    </p>

    <button
      class="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
      @click="crashTheApp"
    >
      Crash the App
    </button>
  </div>
</template>

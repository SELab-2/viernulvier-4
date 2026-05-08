<script lang="ts" setup>
import { computed } from "vue";
import type { NuxtError } from "#app";
import { ROUTES } from "./utils/routes";
import goatsImg from "../../assets/vnv_goats.jpg"; // :-)

/**
 * This is the main error handling page and should be called when fatal errors are thrown.
 * In this file you can define custom display messages for certain error codes etc...
 * note: write the messages in the i18n locales files.
 */

const props = defineProps({
  error: Object as () => NuxtError,
});

const { t } = useI18n();

const handleGoHome = () => clearError({ redirect: ROUTES.home.base });

// booleans for defining what codes we want custom messages for.
const is404 = computed(() => props.error?.status === 404);
const is500 = computed(() => props.error?.status === 500);
// add more here if desired.

const errorTitle = computed(() => {
  // Fallback to status if available, otherwise translate "Oops!"
  return props.error?.status || t("error.titleFallback");
});

// main display messages:
const errorSubtitle = computed(() => {
  if (is404.value) return t("error.subtitle.404");
  if (is500.value) return t("error.subtitle.500");
  // add more custom messages here if desired.

  return t("error.subtitle.default");
});

// sub display messages:
const errorMessage = computed(() => {
  if (is404.value) {
    return t("error.message.404");
  }
  if (is500.value) {
    return t("error.message.500");
  }
  // add more custom messages here if desired.

  return t("error.message.default");
});
</script>

<template>
  <NuxtLayout>
    <div
      class="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 text-center"
    >
      <!-- display the error code -->
      <h1
        class="text-7xl md:text-9xl font-black tracking-tighter mb-4 text-gray-900 dark:text-gray-100"
      >
        {{ errorTitle }}
      </h1>

      <!-- display the error message -->
      <h2 class="text-2xl md:text-4xl font-bold mb-4">
        {{ errorSubtitle }}
      </h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
        {{ errorMessage }} {{ t("error.blame") }}
      </p>

      <!-- display the img -->
      <div
        class="w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl mb-10 border border-gray-200 dark:border-gray-800"
      >
        <img
          :alt="t('error.imgAlt')"
          :src="goatsImg"
          class="w-full h-auto object-cover aspect-video hover:scale-105 transition-transform duration-700 ease-in-out"
        />
      </div>

      <!-- go home button -->
      <button
        class="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-semibold text-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        @click="handleGoHome"
      >
        {{ t("error.goHome") }}
      </button>
    </div>
  </NuxtLayout>
</template>

<style scoped></style>

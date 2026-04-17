<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

import { usePrintView } from "../../composables/media/usePrintView";
const { currentPage, totalPages, loading } = usePrintView();

function goToPage(page: number) {
  // Prevent invalid or unnecessary navigation
  if (
    page < 0 ||
    page > totalPages.value ||
    page === currentPage.value ||
    loading.value
  )
    return;
  currentPage.value = page;
  // Scroll to top after page change
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// constants
const chevronButton =
  "w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed";
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center mt-6">
    <nav
      v-if="totalPages > 1"
      class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
      :aria-label="t('prints.pagination')"
    >
      <!-- First page -->
      <button
        :class="chevronButton"
        :disabled="currentPage === 0"
        @click="goToPage(0)"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.65"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"
          />
        </svg>
      </button>

      <!-- separator -->
      <span class="w-[2px] bg-foreground" />

      <!-- Previous -->
      <button
        :class="chevronButton"
        :disabled="currentPage === 0"
        @click="goToPage(currentPage - 1)"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.65"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      <!-- separator -->
      <span class="w-[2px] bg-foreground" />

      <!-- Current page -->
      <span
        class="w-14 h-8 flex items-center justify-center bg-foreground text-background font-black text-sm"
      >
        {{ currentPage + 1 }}
      </span>

      <span class="w-[2px] bg-foreground" />

      <!-- Next -->
      <button
        :class="chevronButton"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(currentPage + 1)"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.65"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>

      <!-- separator -->
      <span class="w-[2px] bg-foreground" />

      <!-- Last -->
      <button
        :class="chevronButton"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(totalPages - 1)"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.65"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>

<style scoped></style>

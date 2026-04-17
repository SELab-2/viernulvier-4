<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineProps<{
  page: number;
  totalPages: number;
}>();

const emit = defineEmits<{
  (e: "go-to-page", page: number): void;
}>();

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
        :disabled="page === 0"
        @click="emit('go-to-page', 0)"
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
        :disabled="page === 0"
        @click="emit('go-to-page', page - 1)"
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
        {{ page + 1 }}
      </span>

      <span class="w-[2px] bg-foreground" />

      <!-- Next -->
      <button
        :class="chevronButton"
        :disabled="page === totalPages - 1"
        @click="emit('go-to-page', page + 1)"
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
        :disabled="page === totalPages - 1"
        @click="emit('go-to-page', totalPages - 1)"
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

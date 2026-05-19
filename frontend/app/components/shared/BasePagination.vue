<!--
  shared/BasePagination.vue
  ===========================
  Generic pagination control with first/prev/current/next/last buttons.
-->
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:currentPage", page: number): void;
}>();

const { t } = useI18n();

function goToPage(page: number) {
  if (
    page < 1 ||
    page > props.totalPages ||
    page === props.currentPage ||
    props.loading
  )
    return;
  emit("update:currentPage", page);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const btnClass =
  "w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed";
</script>

<template>
  <nav
    v-if="totalPages > 1"
    class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
    :aria-label="t('archive.pagination')"
  >
    <!-- First page -->
    <button
      :class="btnClass"
      :disabled="currentPage === 1 || loading"
      @click="goToPage(1)"
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

    <span class="w-[2px] bg-foreground"></span>

    <!-- Previous -->
    <button
      :class="btnClass"
      :disabled="currentPage === 1 || loading"
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

    <span class="w-[2px] bg-foreground"></span>

    <!-- Current page -->
    <span
      class="w-14 h-8 flex items-center justify-center bg-foreground text-background font-black text-sm"
    >
      {{ currentPage }}
    </span>

    <span class="w-[2px] bg-foreground"></span>

    <!-- Next -->
    <button
      :class="btnClass"
      :disabled="currentPage === totalPages || loading"
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

    <span class="w-[2px] bg-foreground"></span>

    <!-- Last -->
    <button
      :class="btnClass"
      :disabled="currentPage === totalPages || loading"
      @click="goToPage(totalPages)"
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
</template>

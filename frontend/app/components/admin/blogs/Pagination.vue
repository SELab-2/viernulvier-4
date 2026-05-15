<!--
  components/admin/blogs/Pagination.vue
  =======================================
  Pagination bar for the admin blog list.

  Renders:
  - A result count label
  - A page-jump input
  - First / prev / current / next / last nav buttons
-->
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  currentPage: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  jumpInput: string;
}>();

const emit = defineEmits<{
  (e: "update:current-page", page: number): void;
  (e: "update:jump-input", value: string): void;
  (e: "jump"): void;
}>();

const chevronBtn =
  "w-11 flex items-center justify-center bg-background text-foreground hover:bg-foreground/70 hover:text-background transition-colors disabled:opacity-25 disabled:cursor-not-allowed";
</script>

<template>
  <div
    class="flex items-center justify-between pt-4 border-t border-border gap-4 flex-wrap"
  >
    <!-- Result count -->
    <p
      v-if="totalItems > 0 && !loading"
      class="text-[10px] font-brand font-black uppercase tracking-widest text-muted-foreground"
    >
      {{ totalItems }} {{ t("admin.blogs.results") }}
    </p>
    <div v-else class="h-4 w-24 bg-muted rounded animate-pulse" />

    <div v-if="totalPages > 1" class="flex items-center gap-3">
      <!-- Page jumper -->
      <div class="flex items-center gap-2">
        <span
          class="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
        >
          {{ t("archive.page_label") }}
        </span>
        <input
          :value="jumpInput"
          type="number"
          :min="1"
          :max="totalPages"
          :placeholder="currentPage.toString()"
          :disabled="loading"
          @input="
            emit('update:jump-input', ($event.target as HTMLInputElement).value)
          "
          @keydown.enter="emit('jump')"
          @blur="emit('jump')"
          class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span
          class="text-[10px] font-black uppercase tracking-wide text-muted-foreground"
        >
          {{ t("archive.of_pages", { total: totalPages }) }}
        </span>
      </div>

      <!-- Nav buttons -->
      <nav
        class="inline-flex items-stretch rounded-md border-2 border-foreground overflow-hidden"
        :aria-label="t('archive.pagination')"
      >
        <button
          :class="chevronBtn"
          :disabled="currentPage === 1 || loading"
          @click="emit('update:current-page', 1)"
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
        <span class="w-[2px] bg-foreground" />

        <button
          :class="chevronBtn"
          :disabled="currentPage === 1 || loading"
          @click="emit('update:current-page', currentPage - 1)"
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
        <span class="w-[2px] bg-foreground" />

        <span
          class="w-14 h-8 flex items-center justify-center bg-foreground text-background font-black text-sm"
        >
          {{ currentPage }}
        </span>
        <span class="w-[2px] bg-foreground" />

        <button
          :class="chevronBtn"
          :disabled="currentPage === totalPages || loading"
          @click="emit('update:current-page', currentPage + 1)"
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
        <span class="w-[2px] bg-foreground" />

        <button
          :class="chevronBtn"
          :disabled="currentPage === totalPages || loading"
          @click="emit('update:current-page', totalPages)"
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
  </div>
</template>

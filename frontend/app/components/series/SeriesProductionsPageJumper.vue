<!--
SeriesProductionsPageJumper.vue

Input control for navigating directly to a specific page in the productions of a series.
Responsible for:
- Allowing users to enter a page number
- Validating the input against available pages
- Updating the current page in the shared series' productions state
- Scrolling to the top after navigation

Uses:
- useSeriesProductionsView: pagination state (currentPage, totalPages, loading)
-->
<script setup lang="ts">
import { ref } from "vue";
import { useSeriesProductionsView } from "../../composables/useSeriesProductionsView";

const { currentPage, totalPages, loading } = useSeriesProductionsView();
const { t } = useI18n();

const jumpInput = ref("");

function goToPage(page: number) {
  // Prevent invalid or unnecessary navigation
  if (
    page < 1 ||
    page > totalPages.value ||
    page === currentPage.value ||
    loading.value
  )
    return;
  currentPage.value = page;
  // Scroll to top after page change
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleJump() {
  const page = parseInt(jumpInput.value, 10);
  if (!isNaN(page)) goToPage(page);
  // Reset input after attempting jump
  jumpInput.value = "";
}
</script>

<template>
  <div class="flex items-center gap-2">
    <span
      class="text-sm font-black uppercase tracking-wide text-muted-foreground"
    >
      {{ t("archive.page_label") }}
    </span>
    <input
      v-model="jumpInput"
      type="number"
      :min="1"
      :max="totalPages"
      :placeholder="currentPage.toString()"
      :disabled="loading"
      @keydown.enter="handleJump"
      @blur="handleJump"
      class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
    <span
      class="text-sm font-black uppercase tracking-wide text-muted-foreground"
    >
      {{ t("archive.of_pages", { total: totalPages }) }}
    </span>
  </div>
</template>

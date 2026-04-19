<!--
PrintsPageJumper.vue

Input control for navigating directly to a specific page in a prints category.
Responsible for:
- Allowing users to enter a page number
- Validating the input against available pages
- Updating the current page in the shared archive state
- Scrolling to the top after navigation

Uses:
- usePrintView: pagination state (currentPage, totalPages, loading)
-->
<script setup lang="ts">
import { ref } from "vue";
const { t } = useI18n();

const jumpInput = ref("");

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "go-to-page", page: number): void;
}>();

function goToPage(page: number) {
  // Prevent invalid or unnecessary navigation
  if (
    page < 0 ||
    page >= props.totalPages ||
    page === props.currentPage ||
    props.loading
  )
    return;
  emit("go-to-page", page);
  // Scroll to top after page change
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleJump() {
  const page = parseInt(jumpInput.value, 10);
  if (!isNaN(page)) goToPage(page - 1);
  // Reset input after attempting jump
  jumpInput.value = "";
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center gap-2">
    <span
      class="text-sm font-black uppercase tracking-wide text-muted-foreground"
    >
      {{ t("prints.page_label") }}
    </span>
    <input
      v-model="jumpInput"
      type="number"
      :min="1"
      :max="totalPages"
      :placeholder="(currentPage + 1).toString()"
      :disabled="loading"
      @keydown.enter="handleJump"
      @blur="handleJump"
      class="w-14 h-9 rounded-md border-2 border-foreground/20 bg-background px-1 text-sm text-center font-black text-foreground focus:outline-none focus:border-foreground disabled:opacity-25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
    <span
      class="text-sm font-black uppercase tracking-wide text-muted-foreground"
    >
      {{ t("prints.of_pages", { total: totalPages }) }}
    </span>
  </div>
</template>

<style scoped></style>

<!--
  components/admin/blogs/form/FormActions.vue
  =============================================
  Submit row rendered at the bottom of the blog form.

  Shows a validation hint when the form is not yet valid, and a Save/Create
  button that reflects the loading state with a spinner.

  Props:
  - isValid   whether the form passes client-side validation
  - loading   true while the API call is in flight
  - mode      'create' shows the Create label; 'edit' shows Save Changes
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  isValid: boolean;
  loading: boolean;
  mode: "create" | "edit";
}>();

const emit = defineEmits<{
  (e: "submit"): void;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-3 pt-1">
    <!-- Validation hint replaces the empty space on the left -->
    <p
      v-if="!isValid"
      class="text-[10px] text-muted-foreground/60 font-brand font-black uppercase tracking-widest"
    >
      {{ t("admin.blogs.validation.titleNlRequired") }}
    </p>

    <!-- Save / Create button -->
    <button
      type="button"
      :disabled="!isValid || loading"
      class="ml-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
      @click="emit('submit')"
    >
      <!-- Spinner shown while saving -->
      <svg
        v-if="loading"
        class="w-3.5 h-3.5 animate-spin shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>

      <!-- Checkmark icon shown in idle state -->
      <svg
        v-else
        class="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        viewBox="0 0 24 24"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>

      <span v-if="loading">{{ t("admin.saving") }}</span>
      <span v-else-if="mode === 'create'">{{
        t("admin.blogs.createBtn")
      }}</span>
      <span v-else>{{ t("admin.blogs.saveBtn") }}</span>
    </button>
  </div>
</template>

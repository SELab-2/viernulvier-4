<!--
  components/form/FormActions.vue
  ================================
  Submit/action row rendered at the bottom of a form.

  Shows a validation hint when the form is not yet valid, and action buttons
  (submit, reset, back) that reflect the mode and loading state.

  Props:
  - isValid        whether the form passes client-side validation
  - loading        true while the API call is in flight
  - mode           'create' shows Create/Reset; 'edit' shows Save Changes
  - submitLabel    custom label for the submit button (uses mode-based default if omitted)
  - backUrl        URL to navigate to for the back button; if omitted, no back button shown

  Emits:
  - submit()  when the user clicks the primary action
  - reset()   when the user clicks reset (create mode only)
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    isValid: boolean;
    loading: boolean;
    mode: "create" | "edit";
    submitLabel?: string;
    backUrl?: string;
  }>(),
  { submitLabel: "" },
);

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "reset"): void;
}>();

const buttonLabel = computed(() => {
  if (props.submitLabel) return props.submitLabel;
  return props.mode === "create"
    ? t("admin.blogs.createBtn")
    : t("admin.blogs.saveBtn");
});
</script>

<template>
  <div class="flex items-center justify-between gap-3 pt-1">
    <!-- Validation hint or back button (left side) -->
    <div class="flex items-center gap-3">
      <!-- Back button shown in both modes -->
      <NuxtLink
        v-if="props.backUrl"
        :to="props.backUrl"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 h-12 rounded-lg border border-border text-foreground font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {{ t("general.back") }}
      </NuxtLink>

      <!-- Validation hint shown when form is invalid -->
      <p
        v-if="!props.isValid"
        class="text-[10px] text-muted-foreground/60 font-brand font-black uppercase tracking-widest"
      >
        {{ t("admin.blogs.validation.titleNlRequired") }}
      </p>
    </div>

    <!-- Primary action buttons (right side) -->
    <div class="flex items-center gap-2 ml-auto">
      <!-- Reset button (create mode only) -->
      <button
        v-if="props.mode === 'create'"
        type="button"
        :disabled="props.loading"
        class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-border text-foreground font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="emit('reset')"
      >
        {{ t("admin.blogs.resetBtn") }}
      </button>

      <!-- Save / Create button -->
      <button
        type="button"
        :disabled="!props.isValid || props.loading"
        class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
        @click="emit('submit')"
      >
        <!-- Spinner shown while saving -->
        <svg
          v-if="props.loading"
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

        <span v-if="props.loading">{{ t("admin.saving") }}</span>
        <span v-else>{{ buttonLabel }}</span>
      </button>
    </div>
  </div>
</template>

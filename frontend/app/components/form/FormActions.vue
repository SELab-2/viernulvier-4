<!--
  components/form/FormActions.vue
  ================================
  Primary action row rendered at the bottom of admin blog forms.

  Renders differently based on mode:
  - "create" mode: Back button (left) + Reset + Create buttons (right)
  - "edit"   mode: Back button (left) + Restore (optional) + Save Changes button (right)

  The submit button is always purple (accent) and shows a spinner while loading.
  The reset button is only shown in create mode and styled as a secondary outlined button.
  The restore button is only shown when `showRestore` is true (edit mode, page owner passes it).

  Props:
  - isValid      whether the form passes client-side validation
  - loading      true while the API call is in flight
  - mode         'create' shows Create + Reset; 'edit' shows Save Changes
  - submitLabel  custom label for the submit button (uses mode-based default if omitted)
  - backUrl      URL for the back button; if omitted, no back button is shown
  - showRestore  when true an additional "Restore" button is shown (edit mode only)

  Emits:
  - submit()   when the user clicks the primary action button
  - reset()    when the user clicks reset (create mode only)
  - restore()  when the user clicks restore (edit mode only, requires showRestore prop)
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
    showRestore?: boolean;
  }>(),
  { submitLabel: "", showRestore: false },
);

const emit = defineEmits<{
  (e: "submit"): void;
  (e: "reset"): void;
  (e: "restore"): void;
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
    <!-- Left side: back button + validation hint -->
    <div class="flex items-center gap-3">
      <!-- Back navigation link — shown in both modes when backUrl is provided -->
      <NuxtLink
        v-if="props.backUrl"
        :to="props.backUrl"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 h-12 rounded-lg border border-border text-foreground font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-muted/40"
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

      <!-- Validation hint shown when the form is invalid and the user should know why -->
      <p
        v-if="!props.isValid"
        class="text-[10px] text-muted-foreground/60 font-brand font-black uppercase tracking-widest"
      >
        {{ t("admin.blogs.validation.titleNlRequired") }}
      </p>
    </div>

    <!-- Right side: secondary actions + primary submit -->
    <div class="flex items-center gap-2 ml-auto">
      <!--
        Restore button — only in edit mode when explicitly enabled by the parent.
        Restores the form to the last saved state by re-fetching from the server.
      -->
      <button
        v-if="props.mode === 'edit' && props.showRestore"
        type="button"
        :disabled="props.loading"
        class="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-lg border border-border text-muted-foreground font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-muted/40 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
        @click="emit('restore')"
      >
        <svg
          class="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path d="M3 3v5h5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t("admin.blogs.restoreBtn") }}
      </button>

      <!--
        Reset button — only in create mode.
        Clears all fields so the user can start a fresh entry without navigating away.
      -->
      <button
        v-if="props.mode === 'create'"
        type="button"
        :disabled="props.loading"
        class="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-border text-foreground font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:bg-muted/40 disabled:opacity-40 disabled:cursor-not-allowed"
        @click="emit('reset')"
      >
        {{ t("baseform.resetbutton") }}
      </button>

      <!--
        Primary action: Create (create mode) or Save Changes (edit mode).
        Always purple (accent colour), disabled until the form is valid.
      -->
      <button
        type="button"
        :disabled="!props.isValid || props.loading"
        class="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all duration-150 hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
        @click="emit('submit')"
      >
        <!-- Spinner replaces the check icon while the API call is in flight -->
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

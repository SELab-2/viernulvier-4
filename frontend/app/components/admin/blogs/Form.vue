<!--
  components/admin/blogs/Form.vue
  =================================
  Bilingual blog form — title (NL + EN) and rich-text description (NL + EN).

  Composition:
  - FormSectionsTitleSection       two BaseTextArea fields for the titles
  - FormSectionsDescriptionSection two rich-text or plain-text description fields
  - Slot #extra                    injected between description and actions (e.g. LinkToProduction)
  - FormActions                back / reset / restore / submit buttons

  The component is intentionally thin: it owns only the reactive field values,
  the validation computed, and the submit/reset/restore handlers. All layout
  lives in the sub-components so this file stays easy to scan.

  Props:
  - initialData   pre-populate fields when editing an existing blog
  - loading       true while an API call is in flight (disables the submit button)
  - mode          'create' shows Create + Reset; 'edit' shows Save Changes
  - richText      use TipTap rich-text editor instead of plain textarea (default: true)
  - backUrl       navigation target for the back button
  - showRestore   show the Restore button (edit mode only; parent decides when it's relevant)

  Emits:
  - submit(data)         user clicked Save / Create — payload is CreateBlog or ModifyBlog
  - preview-update(data) fires on every keystroke so the live preview panel stays current
  - reset()              user clicked Reset (create mode only)
  - restore()            user clicked Restore (edit mode only, forwarded from FormActions)
-->

<script setup lang="ts">
import type { CreateBlog, ModifyBlog } from "@repo/common";

interface LocalizedPair {
  nl: string;
  en: string;
}

interface InitialData {
  titel?: LocalizedPair;
  description?: LocalizedPair;
}

const props = withDefaults(
  defineProps<{
    initialData?: InitialData;
    loading?: boolean;
    mode?: "create" | "edit";
    richText?: boolean;
    backUrl?: string;
    showRestore?: boolean;
  }>(),
  { mode: "create", loading: false, richText: true, showRestore: false },
);

const emit = defineEmits<{
  (e: "submit", data: CreateBlog | ModifyBlog): void;
  (
    e: "preview-update",
    data: { titel: LocalizedPair; description: LocalizedPair },
  ): void;
  (e: "reset"): void;
  (e: "restore"): void;
}>();

// One reactive ref per localised field. These are kept flat (not nested) so
// watchers and template bindings remain simple.
const titelNl = ref("");
const titelEn = ref("");
const descriptionNl = ref("");
const descriptionEn = ref("");

// Populate fields immediately when editing an existing blog (or when the parent
// finishes fetching and passes initialData down for the first time).
watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    titelNl.value = data.titel?.nl ?? "";
    titelEn.value = data.titel?.en ?? "";
    descriptionNl.value = data.description?.nl ?? "";
    descriptionEn.value = data.description?.en ?? "";
  },
  { immediate: true },
);

// Keep the live preview panel up to date on every keystroke so the preview
// always reflects what the editor is currently writing.
watch([titelNl, titelEn, descriptionNl, descriptionEn], () => {
  emit("preview-update", {
    titel: { nl: titelNl.value, en: titelEn.value },
    description: { nl: descriptionNl.value, en: descriptionEn.value },
  });
});

// The form is valid as soon as both required Dutch fields contain non-empty text.
// English fields are optional and fall back to Dutch on submit.
const isValid = computed(
  () =>
    titelNl.value.trim().length > 0 && descriptionNl.value.trim().length > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;

  emit("submit", {
    titel: {
      nl: titelNl.value.trim(),
      // English falls back to Dutch when the field is left empty.
      en: titelEn.value.trim() || titelNl.value.trim(),
    },
    description: {
      nl: descriptionNl.value.trim(),
      en: descriptionEn.value.trim() || descriptionNl.value.trim(),
    },
  });
}

function handleReset() {
  titelNl.value = "";
  titelEn.value = "";
  descriptionNl.value = "";
  descriptionEn.value = "";
  emit("reset");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- Title section: NL (required) + EN (optional, falls back to NL) -->
    <FormSectionsTitleSection
      v-model:titelNl="titelNl"
      v-model:titelEn="titelEn"
    />

    <!-- Description section: rich-text or plain textarea, same bilingual pattern -->
    <FormSectionsDescriptionSection
      v-model:descriptionNl="descriptionNl"
      v-model:descriptionEn="descriptionEn"
      :rich-text="props.richText"
    />

    <!--
      Extra slot: the parent injects additional cards here (e.g. LinkToProduction).
      This slot sits between the description card and the action row so the
      submit button is always at the very bottom of the form.
    -->
    <slot name="extra" />

    <!-- Action row: back / restore / reset / submit -->
    <FormActions
      :is-valid="isValid"
      :loading="loading"
      :mode="mode"
      :back-url="backUrl"
      :show-restore="showRestore"
      @submit="handleSubmit"
      @reset="handleReset"
      @restore="emit('restore')"
    />
  </form>
</template>

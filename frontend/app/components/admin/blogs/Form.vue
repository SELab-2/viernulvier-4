<!--
  components/admin/blogs/Form.vue
  =================================
  Bilingual blog form — title (NL + EN) and description (NL + EN).

  Composition:
  - AdminBlogsFormTitleSection       two BaseTextArea fields for the titles
  - AdminBlogsFormDescriptionSection two AdminEditor fields for the rich-text body
  - AdminBlogsFormFormActions        submit button with spinner and validation hint

  The component is intentionally thin: it owns only the reactive field values,
  the validation computed, and the submit handler. All markup lives in the
  three sub-components above so this file stays easy to scan.

  Emits:
  - submit(data)         when the user clicks Save / Create
  - preview-update(data) on every keystroke so the live preview panel stays current

  Slots:
  - #extra               rendered between DescriptionSection and FormActions,
                         used by the parent to inject LinkToProduction
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
  }>(),
  { mode: "create", loading: false },
);

const emit = defineEmits<{
  (e: "submit", data: CreateBlog | ModifyBlog): void;
  (
    e: "preview-update",
    data: { titel: LocalizedPair; description: LocalizedPair },
  ): void;
}>();

// Reactive field values, one ref per localised field.
const titelNl = ref("");
const titelEn = ref("");
const descriptionNl = ref("");
const descriptionEn = ref("");

// Populate fields when editing an existing blog.
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

// Keep the live preview panel up to date on every keystroke.
watch([titelNl, titelEn, descriptionNl, descriptionEn], () => {
  emit("preview-update", {
    titel: { nl: titelNl.value, en: titelEn.value },
    description: { nl: descriptionNl.value, en: descriptionEn.value },
  });
});

// The form is valid as soon as both required Dutch fields have content.
const isValid = computed(
  () =>
    titelNl.value.trim().length > 0 && descriptionNl.value.trim().length > 0,
);

function handleSubmit() {
  if (!isValid.value || props.loading) return;

  emit("submit", {
    titel: {
      nl: titelNl.value.trim(),
      en: titelEn.value.trim() || titelNl.value.trim(),
    },
    description: {
      nl: descriptionNl.value.trim(),
      en: descriptionEn.value.trim() || descriptionNl.value.trim(),
    },
  });
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="handleSubmit">
    <!-- Title fields (NL + EN) -->
    <AdminBlogsFormTitleSection
      v-model:titelNl="titelNl"
      v-model:titelEn="titelEn"
    />

    <!-- Rich-text description fields (NL + EN) -->
    <AdminBlogsFormDescriptionSection
      v-model:descriptionNl="descriptionNl"
      v-model:descriptionEn="descriptionEn"
    />

    <!--
      Extra slot: LinkToProduction is injected here by the parent
      so it sits between the description card and the submit button.
    -->
    <slot name="extra" />

    <!-- Submit / validation row -->
    <AdminBlogsFormFormActions
      :is-valid="isValid"
      :loading="loading"
      :mode="mode"
      @submit="handleSubmit"
    />
  </form>
</template>

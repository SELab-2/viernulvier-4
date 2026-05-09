<!--
  components/admin/blogs/ItemMetadata.vue
  ==========================================
  Form card for editing the title and credits of a media item.

  This component was split out of ImageSection.vue to separate the crop-upload
  concern (CropGrid.vue) from the text-metadata concern.

  The four fields (title NL/EN and credits NL/EN) all fall back to their Dutch
  counterpart when the English field is left empty — consistent with how blog
  titles and descriptions work throughout the admin.

  Props:
  - disabled  — when true the Save button is greyed out (no item loaded yet)
  - saving    — when true the button shows a spinner

  v-model bindings (one for each field):
  - titleNl, titleEn, creditsNl, creditsEn

  Emits:
  - save — user clicked "Save", parent handles the API call
-->

<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  /** Disable the save button when no media item has been loaded yet. */
  disabled?: boolean;
  /** Show spinner on the save button while the API call is in flight. */
  saving?: boolean;
}>();

const emit = defineEmits<{
  /** Parent handles the actual modifyItem() call. */
  (e: "save"): void;
}>();

// Two-way bindings for the four localised fields.
const titleNl = defineModel<string>("titleNl", { default: "" });
const titleEn = defineModel<string>("titleEn", { default: "" });
const creditsNl = defineModel<string>("creditsNl", { default: "" });
const creditsEn = defineModel<string>("creditsEn", { default: "" });
</script>

<template>
  <FormSectionsSectionCard :title="t('admin.blogs.image.metadataTitle')">
    <!-- Fields -->
    <div class="p-5 space-y-0">
      <!--
        BaseInput components for all four fields.
        English fields fall back to Dutch when left empty (handled in parent on save).
      -->
      <FormFieldsBaseInput
        v-model="titleNl"
        :label="t('admin.blogs.image.itemTitleNl')"
      />
      <FormFieldsBaseInput
        v-model="titleEn"
        :label="t('admin.blogs.image.itemTitleEn')"
      />
      <FormFieldsBaseInput
        v-model="creditsNl"
        :label="t('admin.blogs.image.itemCreditsNl')"
      />
      <FormFieldsBaseInput
        v-model="creditsEn"
        :label="t('admin.blogs.image.itemCreditsEn')"
      />

      <!-- Save button -->
      <div class="flex justify-end px-4 pb-2">
        <button
          type="button"
          :disabled="props.saving || props.disabled"
          class="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-accent text-white font-brand font-black text-[11px] uppercase tracking-widest transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          @click="emit('save')"
        >
          {{ props.saving ? t("admin.saving") : t("admin.save") }}
        </button>
      </div>
    </div>
  </FormSectionsSectionCard>
</template>

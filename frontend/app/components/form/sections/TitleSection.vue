<!--
  components/form/sections/TitleSection.vue
  ==========================================
  Bilingual title input section (Dutch + English).

  The Dutch title is required; the English title falls back to the Dutch value
  when left empty. Both fields use BaseTextArea for consistent styling.

  Props:
  - titelNl  v-model for the Dutch title
  - titelEn  v-model for the English title
  - titleLabel  locale key for the section title
  - titleNlLabel  locale key for Dutch label
  - titleNlPlaceholder  locale key for Dutch placeholder
  - titleEnLabel  locale key for English label
  - titleEnPlaceholder  locale key for English placeholder
  - titleEnFallback  locale key for fallback hint
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

withDefaults(
  defineProps<{
    titleLabel?: string;
    titleNlLabel?: string;
    titleNlPlaceholder?: string;
    titleEnLabel?: string;
    titleEnPlaceholder?: string;
    titleEnFallback?: string;
  }>(),
  {
    titleLabel: "admin.blogs.sectionTitle",
    titleNlLabel: "admin.blogs.titleNl",
    titleNlPlaceholder: "admin.blogs.titleNlPlaceholder",
    titleEnLabel: "admin.blogs.titleEn",
    titleEnPlaceholder: "admin.blogs.titleEnPlaceholder",
    titleEnFallback: "admin.blogs.titleEnFallback",
  },
);

const titelNl = defineModel<string>("titelNl", { default: "" });
const titelEn = defineModel<string>("titelEn", { default: "" });

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2 px-4 pt-4";
</script>

<template>
  <FormSectionsSectionCard :title="t(titleLabel)">
    <div class="pb-2">
      <!-- Dutch title — required field -->
      <label :class="labelCls">
        {{ t(titleNlLabel) }}
        <span class="text-red-500 ml-0.5">*</span>
      </label>
      <FormFieldsBaseTextArea
        v-model="titelNl"
        :placeholder="t(titleNlPlaceholder)"
        :rows="2"
        required
      />

      <!-- English title — falls back to Dutch when empty -->
      <label :class="labelCls">{{ t(titleEnLabel) }}</label>
      <FormFieldsBaseTextArea
        v-model="titelEn"
        :placeholder="t(titleEnPlaceholder)"
        :rows="2"
      />
      <p class="px-4 pb-2 text-[9px] text-muted-foreground/60">
        {{ t(titleEnFallback) }}
      </p>
    </div>
  </FormSectionsSectionCard>
</template>

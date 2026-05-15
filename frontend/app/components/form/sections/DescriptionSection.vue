<!--
  components/form/sections/DescriptionSection.vue
  ================================================
  Bilingual description input section (Dutch + English).

  The field type is configurable via the richText prop:
  - richText: true  → uses AdminEditor (TipTap-based, rich formatting)
  - richText: false → uses FormFieldsBaseTextArea (plain text)

  The Dutch description is required; the English description falls back to the
  Dutch value when left empty.

  Props:
  - richText       whether to use rich-text editor (default: true)
  - descriptionNl  v-model for the Dutch content
  - descriptionEn  v-model for the English content
  - sectionLabel  locale key for section title
  - descNlLabel  locale key for Dutch label
  - descNlPlaceholder  locale key for Dutch placeholder
  - descEnLabel  locale key for English label
  - descEnPlaceholder  locale key for English placeholder
  - descEnFallback  locale key for fallback hint
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

withDefaults(
  defineProps<{
    richText?: boolean;
    sectionLabel?: string;
    descNlLabel?: string;
    descNlPlaceholder?: string;
    descEnLabel?: string;
    descEnPlaceholder?: string;
    descEnFallback?: string;
  }>(),
  {
    richText: true,
    sectionLabel: "admin.blogs.sectionContent",
    descNlLabel: "admin.blogs.descriptionNl",
    descNlPlaceholder: "admin.blogs.descriptionNlPlaceholder",
    descEnLabel: "admin.blogs.descriptionEn",
    descEnPlaceholder: "admin.blogs.descriptionEnPlaceholder",
    descEnFallback: "admin.blogs.descriptionEnFallback",
  },
);

const descriptionNl = defineModel<string>("descriptionNl", { default: "" });
const descriptionEn = defineModel<string>("descriptionEn", { default: "" });

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2";
</script>

<template>
  <FormSectionsSectionCard :title="t(sectionLabel)">
    <div class="p-5 space-y-5">
      <!-- Dutch description — required -->
      <div>
        <label :class="labelCls">
          {{ t(descNlLabel) }}
          <span class="text-red-500 ml-0.5">*</span>
        </label>
        <FormSectionsDynamicField
          v-model="descriptionNl"
          :rich-text="richText"
          :placeholder="t(descNlPlaceholder)"
        />
      </div>

      <!-- English description — optional, falls back to Dutch -->
      <div>
        <label :class="labelCls">
          {{ t(descEnLabel) }}
        </label>
        <FormSectionsDynamicField
          v-model="descriptionEn"
          :rich-text="richText"
          :placeholder="t(descEnPlaceholder)"
        />
        <p class="mt-1.5 text-[9px] text-muted-foreground/60">
          {{ t(descEnFallback) }}
        </p>
      </div>
    </div>
  </FormSectionsSectionCard>
</template>

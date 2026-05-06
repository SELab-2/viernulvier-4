<!--
  components/admin/blogs/form/TitleSection.vue
  ==============================================
  Card containing the bilingual title fields (Dutch + English).

  The Dutch title is required; the English title falls back to the Dutch value
  when left empty (same convention used for blog descriptions).

  Both fields use BaseTextArea so the height and styling are consistent with
  the rest of the admin form library.

  Props:
  - titelNl  v-model for the Dutch title
  - titelEn  v-model for the English title
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const titelNl = defineModel<string>("titelNl", { default: "" });
const titelEn = defineModel<string>("titelEn", { default: "" });

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2 px-4 pt-4";
</script>

<template>
  <AdminBlogsSectionCard :title="t('admin.blogs.sectionTitle')">
    <div class="pb-2">
      <!-- Dutch title — required field -->
      <label :class="labelCls">
        {{ t("admin.blogs.titleNl") }}
        <span class="text-red-500 ml-0.5">*</span>
      </label>
      <FormFieldsBaseTextArea
        v-model="titelNl"
        :placeholder="t('admin.blogs.titleNlPlaceholder')"
        :rows="2"
        required
      />

      <!-- English title — falls back to Dutch when empty -->
      <label :class="labelCls">{{ t("admin.blogs.titleEn") }}</label>
      <FormFieldsBaseTextArea
        v-model="titelEn"
        :placeholder="t('admin.blogs.titleEnPlaceholder')"
        :rows="2"
      />
      <p class="px-4 pb-2 text-[9px] text-muted-foreground/60">
        {{ t("admin.blogs.titleEnFallback") }}
      </p>
    </div>
  </AdminBlogsSectionCard>
</template>

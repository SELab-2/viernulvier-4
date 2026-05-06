<!--
  components/admin/blogs/form/DescriptionSection.vue
  ====================================================
  Card containing the bilingual rich-text description fields (Dutch + English).

  Both editors use AdminEditor (TipTap-based) so formatting toolbar and
  scrollable content area behave identically to the rest of the admin interface.

  The Dutch description is required; the English description falls back to the
  Dutch value when left empty.

  Props:
  - descriptionNl  v-model for the Dutch rich-text content
  - descriptionEn  v-model for the English rich-text content
-->

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const descriptionNl = defineModel<string>("descriptionNl", { default: "" });
const descriptionEn = defineModel<string>("descriptionEn", { default: "" });

const labelCls =
  "block text-[9px] font-brand font-black uppercase tracking-widest text-muted-foreground mb-2";
</script>

<template>
  <AdminBlogsSectionCard :title="t('admin.blogs.sectionContent')">
    <div class="p-5 space-y-5">
      <!-- Dutch description — required -->
      <div>
        <label :class="labelCls">
          {{ t("admin.blogs.descriptionNl") }}
          <span class="text-red-500 ml-0.5">*</span>
        </label>
        <AdminEditor
          v-model="descriptionNl"
          :placeholder="t('admin.blogs.descriptionNlPlaceholder')"
        />
      </div>

      <!-- English description — optional, falls back to Dutch -->
      <div>
        <label :class="labelCls">
          {{ t("admin.blogs.descriptionEn") }}
        </label>
        <AdminEditor
          v-model="descriptionEn"
          :placeholder="t('admin.blogs.descriptionEnPlaceholder')"
        />
        <p class="mt-1.5 text-[9px] text-muted-foreground/60">
          {{ t("admin.blogs.descriptionEnFallback") }}
        </p>
      </div>
    </div>
  </AdminBlogsSectionCard>
</template>

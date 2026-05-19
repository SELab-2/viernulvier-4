<script setup lang="ts">
import { computed } from "vue";
import type { FormField } from "~/types/FormField";
import type { ProductionTranslationForm } from "~/composables/productions/steps/productionCore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  language?: "nl" | "en";

  /**
   * FormBaseForm controlled state.
   * Parent fully owns the data.
   */
  modelValue: ProductionTranslationForm;
}

const props = withDefaults(defineProps<Props>(), {
  language: "nl",
});

const emit = defineEmits<{
  "update:modelValue": [ProductionTranslationForm];
}>();

const isRequired = computed(() => props.language === "nl");

const fields = computed<FormField[]>(() => [
  {
    component: "BaseInput",
    name: "titel",
    props: {
      label: t("admin-productions.form-title"),
      required: isRequired.value,
    },
  },
  {
    component: "BaseTextArea",
    name: "description1",
    props: {
      label: t("admin-productions.form-description1"),
      required: isRequired.value,
    },
  },
  {
    component: "BaseTextArea",
    name: "description2",
    props: {
      label: t("admin-productions.form-description2"),
    },
  },
  {
    component: "BaseInput",
    name: "tagline",
    props: {
      label: t("admin-productions.form-tagline"),
    },
  },
  {
    component: "BaseTextArea",
    name: "credits",
    props: {
      label: t("admin-productions.form-credits"),
    },
  },
  {
    component: "BaseInput",
    name: "artist",
    props: {
      label: t("admin-productions.form-artists"),
    },
  },
]);
</script>

<template>
  <FormBaseForm
    :fields="fields"
    :showActions="false"
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
  />
</template>

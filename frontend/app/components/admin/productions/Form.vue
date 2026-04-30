<script setup lang="ts">
import { computed } from "vue";
import type { FormField } from "~/types/FormField";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Props {
  language?: "nl" | "en";
}

const props = withDefaults(defineProps<Props>(), {
  language: "nl",
});

const isRequired = computed(() => props.language === "nl");

const emit = defineEmits<{
  submit: [Record<string, any>];
}>();

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
      required: isRequired.value,
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
  <FormBaseForm :fields="fields" @submit="emit('submit', $event)" />
</template>

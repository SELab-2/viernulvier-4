<script setup lang="ts">
import type { FormField } from "../../../types/FormField";
import { usePrintApi } from "../../../composables/media/usePrintApi";
import { PrintTypeValues } from "@repo/common";

const { t } = useI18n();
const fields: FormField[] = [
  {
    component: "BaseInput",
    name: "titel",
    props: { label: t("prints.form.title"), required: true },
  },
  {
    component: "BaseSelect",
    name: "print_type",
    props: {
      label: t("prints.form.type"),
      required: true,
      options: PrintTypeValues.map((type) => ({
        label: t(`prints.types.${type}`),
        value: type,
      })),
    },
  },
  {
    component: "BaseFileUpload",
    name: "file",
    props: {
      label: t("prints.form.file"),
      required: true,
      accept: ".pdf,.png,.jpg,.jpeg",
    },
  },
];
</script>

<template></template>

<style scoped></style>

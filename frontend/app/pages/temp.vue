<script setup lang="ts">
import type { FormField } from "../types/FormField";

const fields = computed<FormField[]>(() => [
  {
    component: "BaseDate",
    name: "basedate",
    props: { label: "BaseDate", required: true },
  },
  {
    component: "BaseFileUpload",
    name: "basefileupload",
    props: { label: "BaseFileUpload", required: true },
  },
  {
    component: "BaseInput",
    name: "baseinput",
    props: { label: "BaseInput", required: true },
  },
  {
    component: "BaseMultiSelect",
    name: "basemultiselect",
    props: {
      label: "BaseMultiSelect",
      required: true,
      options: ["one", "two", "three"],
    },
  },
  {
    component: "BaseSelect",
    name: "baseselect",
    props: {
      label: "BaseSelect",
      required: true,
      options: ["one", "two", "three"],
    },
  },
  {
    component: "BaseTagInput",
    name: "basetaginput",
    props: { label: "BaseTagInput", required: true },
  },
  {
    component: "BaseTextArea",
    name: "basetextarea",
    props: { label: "BaseTextArea", required: true },
  },
]);
</script>

<template>
  <FormBaseForm :fields="fields" @submit="{}" />
</template>

<style scoped></style>

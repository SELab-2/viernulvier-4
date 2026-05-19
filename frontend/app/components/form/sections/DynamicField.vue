<!--
  components/form/sections/DynamicField.vue
  ==========================================
  Conditionally renders either AdminEditor (rich-text) or FormFieldsBaseTextArea (plain)
  based on the richText prop, allowing a single field component to handle both modes.

  This keeps parent components DRY by avoiding v-if/v-else duplication per field.

  Props:
  - richText     whether to render the rich-text editor (default: true)
  - placeholder  the input placeholder text
  - rows         number of rows (only used for plain textarea)

  Model:
  - v-model for the field content
-->

<script setup lang="ts">
withDefaults(
  defineProps<{
    richText?: boolean;
    placeholder?: string;
    rows?: number;
  }>(),
  { richText: true, rows: 4 },
);

const model = defineModel<string>({ default: "" });
</script>

<template>
  <AdminEditor v-if="richText" v-model="model" :placeholder="placeholder" />
  <FormFieldsBaseTextArea
    v-else
    v-model="model"
    :placeholder="placeholder"
    :rows="rows"
  />
</template>

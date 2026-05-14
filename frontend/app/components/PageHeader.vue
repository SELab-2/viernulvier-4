<!--
  Hero header, usable for pages (archive/prints/stories). Shows the section title and a short
  description.
-->
<script lang="ts" setup>
defineProps<{
  title: string;
  description?: string;
  isAdmin?: boolean;
}>();
const { t } = useI18n();
</script>

<template>
  <header
    class="w-full border-b border-border bg-muted transition-colors duration-200"
  >
    <div class="page-container py-8 sm:py-12">
      <h1 class="page-header-title">
        {{ title }}
      </h1>
      <p v-if="description" class="page-header-subtitle">
        {{ description }}
      </p>
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped></style>

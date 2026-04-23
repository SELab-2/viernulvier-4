<!--
ArchiveHeader.vue

Displays the header section of the archive page.

Modes:
- Public: title + subtitle
- Admin: title only
-->
<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    isAdmin?: boolean;
  }>(),
  {
    isAdmin: false,
  },
);

const { t } = useI18n();
</script>

<template>
  <header
    class="w-full border-b border-border bg-muted transition-colors duration-200"
  >
    <div class="page-container py-12">
      <!-- Title -->
      <h1 class="page-header-title">
        {{
          props.isAdmin
            ? t("admin-productions.header_title")
            : t("archive.header_title")
        }}
      </h1>
      <!-- Public subtitle only -->
      <p v-if="!props.isAdmin" class="page-header-subtitle">
        {{ t("archive.header_subtitle") }}
      </p>
    </div>
  </header>
</template>

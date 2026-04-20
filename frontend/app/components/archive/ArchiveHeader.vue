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
  <header class="w-full border-b border-border bg-muted">
    <div class="max-w-5xl mx-auto px-4 py-12">
      <!-- Title -->
      <h1
        class="font-brand text-4xl md:text-5xl font-black tracking-tight text-foreground"
      >
        {{
          props.isAdmin
            ? t("admin-productions.header_title")
            : t("archive.header_title")
        }}
      </h1>

      <!-- Public subtitle only -->
      <p
        v-if="!props.isAdmin"
        class="mt-4 text-base md:text-lg text-muted-foreground max-w-xl"
      >
        {{ t("archive.header_subtitle") }}
      </p>
    </div>
  </header>
</template>

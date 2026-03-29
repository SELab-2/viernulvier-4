<script lang="ts" setup>
const { t } = useI18n();
</script>

<template>
  <header class="w-full border-b border-border bg-background">
    <div class="max-w-5xl mx-auto px-4 py-12">
      <h1 class="font-brand text-4xl md:text-5xl font-black tracking-tight text-foreground">
        {{ t('archive.header_title') }}
      </h1>
      <p class="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
        {{ t('archive.header_subtitle') }}
      </p>
    </div>
  </header>
</template>

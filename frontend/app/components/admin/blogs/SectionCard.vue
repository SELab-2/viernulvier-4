<!--
  components/admin/blogs/SectionCard.vue
  =========================================
  Reusable card shell used throughout the admin blog edit flow.

  Renders a card with:
  - A coloured accent bar + title in the header
  - An optional subtitle below the title
  - A default slot for the card body

  Used by Form.vue, LinkToProduction.vue, ImageSection.vue and any other
  section that needs the same visual container without duplicating markup.

  Props:
  - title     (required) short section heading shown in the header
  - subtitle  optional secondary line rendered below the title
-->

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="rounded-xl border border-card-border bg-card overflow-hidden">
    <!-- Card header with accent bar -->
    <div
      class="flex items-center gap-3 px-5 py-4 border-b border-card-border bg-card-hover"
    >
      <div class="w-1 h-5 rounded-full bg-accent shrink-0" />
      <div>
        <h2
          class="font-brand font-black text-[11px] uppercase tracking-widest text-foreground"
        >
          {{ title }}
        </h2>
        <p v-if="subtitle" class="text-[10px] text-muted-foreground mt-0.5">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <!-- Card body — supplied by the consumer -->
    <slot />
  </div>
</template>
